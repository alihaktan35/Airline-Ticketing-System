import "reflect-metadata";
import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import axios from 'axios';
import { AppDataSource } from './data-source';
import { Flight } from './entity/Flight';
import { Booking } from './entity/Booking';

import { LessThan } from 'typeorm';
import { authenticateJWT, isAdmin } from './middleware/auth';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Just a simple points calculation for awarding miles
const POINTS_AWARDED_PER_DOLLAR = 1;

app.get('/', (req: Request, res: Response) => {
  res.send('Flight Service is running!');
});

// Endpoint for the scheduler to call to award miles
app.post('/flights/award-miles', async (req: Request, res: Response) => {
    console.log('Awarding miles for completed flights...');
    try {
        const flightRepository = AppDataSource.getRepository(Flight);
        const bookingRepository = AppDataSource.getRepository(Booking);

        // 1. Find flights that were completed yesterday
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        // This is a simplified way to get "yesterday's" flights
        const startOfYesterday = new Date(yesterday.setHours(0, 0, 0, 0));
        const endOfYesterday = new Date(yesterday.setHours(23, 59, 59, 999));

        const completedFlights = await flightRepository.find({
            where: {
                flightDate: LessThan(endOfYesterday) // Simplified: any flight before end of yesterday
            }
        });

        if (completedFlights.length === 0) {
            return res.status(200).send('No completed flights to award miles for.');
        }

        let totalPointsAwarded = 0;

        // 2. Find bookings for those flights
        for (const flight of completedFlights) {
            const bookings = await bookingRepository.find({ where: { flightId: flight.id } });
            
            for (const booking of bookings) {
                const pointsToAward = flight.price * booking.numberOfPassengers * POINTS_AWARDED_PER_DOLLAR;

                // 3. Call iam-service to award points
                try {
                    await axios.post(`http://localhost:3002/users/${booking.userId}/update-points`, {
                        points: pointsToAward
                    });
                    totalPointsAwarded += pointsToAward;
                    console.log(`Awarded ${pointsToAward} points to user ${booking.userId}`);
                } catch (iamError: any) {
                    console.error(`Failed to award points to user ${booking.userId}:`, iamError.response?.data);
                    // Continue to the next booking
                }
            }
            // Optional: Mark the flight as "processed" to prevent re-awarding points.
            // This would require a new field in the Flight entity, e.g., 'milesAwarded'.
        }

        res.status(200).json({ message: 'Miles awarded successfully.', totalPointsAwarded });

    } catch (error) {
        console.error('Error in award-miles job:', error);
        res.status(500).send('An error occurred while awarding miles.');
    }
});


// Endpoint to add a new flight, now protected
app.post('/flights', authenticateJWT, isAdmin, async (req: Request, res: Response) => {
  try {
    const { fromCity, toCity, flightDate, flightCode, price, duration, capacity } = req.body;
    const flightRepository = AppDataSource.getRepository(Flight);

    const newFlight = flightRepository.create({
      fromCity,
      toCity,
      flightDate: new Date(flightDate), // Ensure date is correctly parsed
      flightCode,
      price,
      duration,
      capacity,
    });

    await flightRepository.save(newFlight);
    res.status(201).json(newFlight);
  } catch (error) {
    console.error('Error adding flight:', error);
    res.status(500).send('Error adding flight');
  }
});

// Mock ML Price Prediction Endpoint
app.get('/flights/predict-price', (req: Request, res: Response) => {
    // In a real scenario, this would use a machine learning model
    // to predict the price based on query parameters like fromCity, toCity, flightDate, etc.
    const mockPredictedPrice = 5000;
    res.status(200).json({ predictedPrice: mockPredictedPrice });
});

// Endpoint to search for flights with pagination
app.get('/flights', async (req: Request, res: Response) => {
    try {
        const { fromCity, toCity, flightDate, page = '1', limit = '10' } = req.query;

        if (!fromCity || !toCity || !flightDate) {
            return res.status(400).send('Please provide fromCity, toCity, and flightDate query parameters.');
        }

        const pageNumber = parseInt(page as string);
        const limitNumber = parseInt(limit as string);
        const skip = (pageNumber - 1) * limitNumber;

        const flightRepository = AppDataSource.getRepository(Flight);

        const [flights, total] = await flightRepository.findAndCount({
            where: {
                fromCity: fromCity as string,
                toCity: toCity as string,
                flightDate: new Date(flightDate as string),
            },
            skip,
            take: limitNumber,
            order: {
                flightDate: 'ASC',
                id: 'ASC'
            }
        });

        res.status(200).json({
            data: flights,
            pagination: {
                page: pageNumber,
                limit: limitNumber,
                total,
                totalPages: Math.ceil(total / limitNumber)
            }
        });
    } catch (error) {
        console.error('Error searching flights:', error);
        res.status(500).send('Error searching flights');
    }
});

// Endpoint to get a single flight by ID
app.get('/flights/:id', async (req: Request, res: Response) => {
    try {
        const flightId = parseInt(req.params.id);
        const flightRepository = AppDataSource.getRepository(Flight);
        const flight = await flightRepository.findOneBy({ id: flightId });

        if (!flight) {
            return res.status(404).send('Flight not found.');
        }

        res.status(200).json(flight);
    } catch (error) {
        console.error('Error fetching flight:', error);
        res.status(500).send('Error fetching flight');
    }
});

// Endpoint to book a flight (cash)
app.post('/flights/:id/book', async (req: Request, res: Response) => {
    try {
        const flightId = parseInt(req.params.id);
        const { userId, numberOfPassengers } = req.body;

        if (!userId || !numberOfPassengers || numberOfPassengers <= 0) {
            return res.status(400).send('Please provide userId and a valid number of passengers.');
        }

        await AppDataSource.manager.transaction(async (transactionalEntityManager) => {
            const flightRepository = transactionalEntityManager.getRepository(Flight);
            const bookingRepository = transactionalEntityManager.getRepository(Booking);

            const flight = await flightRepository.findOne({ where: { id: flightId }, lock: { mode: 'pessimistic_write' } });

            if (!flight) {
                throw new Error('Flight not found.');
            }

            if (flight.capacity < numberOfPassengers) {
                throw new Error('Not enough capacity on this flight.');
            }

            flight.capacity -= numberOfPassengers;
            await flightRepository.save(flight);
            
            const newBooking = bookingRepository.create({
                flightId,
                userId,
                numberOfPassengers,
            });
            await bookingRepository.save(newBooking);

            res.status(200).json({ message: 'Booking successful!', flight });
        });

    } catch (error: any) {
        console.error('Error booking flight:', error);
        if (!res.headersSent) {
            res.status(400).send(error.message);
        }
    }
});

const POINTS_PER_DOLLAR = 10;

// Endpoint to book a flight with points
app.post('/flights/:id/book-with-points', async (req: Request, res: Response) => {
    const { userId, numberOfPassengers } = req.body;
    const flightId = parseInt(req.params.id);

    if (!userId || !numberOfPassengers || numberOfPassengers <= 0) {
        return res.status(400).send('Please provide userId and a valid number of passengers.');
    }

    try {
        const flightRepository = AppDataSource.getRepository(Flight);
        const flight = await flightRepository.findOneBy({ id: flightId });

        if (!flight) return res.status(404).send('Flight not found.');
        if (flight.capacity < numberOfPassengers) return res.status(400).send('Not enough capacity.');

        const totalPointsCost = flight.price * numberOfPassengers * POINTS_PER_DOLLAR;

        // 1. Deduct points via iam-service
        await axios.post(`http://localhost:3002/users/${userId}/update-points`, { points: -totalPointsCost });

        // 2. Update capacity and create booking record
        await AppDataSource.manager.transaction(async (tem) => {
            const flightToUpdate = await tem.findOneOrFail(Flight, { where: { id: flightId }, lock: { mode: 'pessimistic_write' } });
            flightToUpdate.capacity -= numberOfPassengers;
            await tem.save(flightToUpdate);

            const newBooking = tem.create(Booking, { flightId, userId, numberOfPassengers });
            await tem.save(newBooking);

            res.status(200).json({ message: 'Booking with points successful!', flight: flightToUpdate });
        });

    } catch (error: any) {
        console.error('Error booking flight with points:', error);
        // NOTE: A compensating transaction (refunding points) should be implemented here in a real system.
        if (!res.headersSent) {
            const message = error.response?.data || 'Error booking flight with points.';
            res.status(500).send(message);
        }
    }
});


AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
    app.listen(port, () => {
      console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
    });
  })
  .catch((error) => console.error("Error during Data Source initialization:", error));