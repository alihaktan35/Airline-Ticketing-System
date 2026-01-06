import "reflect-metadata";
import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { AppDataSource } from './data-source';
import { Flight } from './entity/Flight';

import { authenticateJWT, isAdmin } from './middleware/auth';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Flight Service is running!');
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

// Endpoint to search for flights
app.get('/flights', async (req: Request, res: Response) => {
    try {
        const { fromCity, toCity, flightDate } = req.query;

        if (!fromCity || !toCity || !flightDate) {
            return res.status(400).send('Please provide fromCity, toCity, and flightDate query parameters.');
        }

        const flightRepository = AppDataSource.getRepository(Flight);
        
        // This is a simplified search. A real implementation would handle date ranges, etc.
        const flights = await flightRepository.find({
            where: {
                fromCity: fromCity as string,
                toCity: toCity as string,
                // A more robust date comparison would be needed in a real app
                // This is a simple exact date match for now
                flightDate: new Date(flightDate as string), 
            }
        });

        res.status(200).json(flights);
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

// Endpoint to book a flight
app.post('/flights/:id/book', async (req: Request, res: Response) => {
    try {
        const flightId = parseInt(req.params.id);
        const { numberOfPassengers } = req.body;

        if (!numberOfPassengers || numberOfPassengers <= 0) {
            return res.status(400).send('Please provide a valid number of passengers.');
        }

        await AppDataSource.manager.transaction(async (transactionalEntityManager) => {
            const flightRepository = transactionalEntityManager.getRepository(Flight);
            const flight = await flightRepository.findOne({
                where: { id: flightId },
                lock: { mode: 'pessimistic_write' }, // Lock the row for update
            });

            if (!flight) {
                return res.status(404).send('Flight not found.');
            }

            if (flight.capacity < numberOfPassengers) {
                return res.status(400).send('Not enough capacity on this flight.');
            }

            flight.capacity -= numberOfPassengers;
            await flightRepository.save(flight);

            res.status(200).json({ message: 'Booking successful!', flight });
        });

    } catch (error: any) {
        console.error('Error booking flight:', error);
        // The transaction will automatically roll back on error
        // Send a generic error message, but the specific response might have been sent already
        if (!res.headersSent) {
            if (error.message.includes('Not enough capacity') || error.message.includes('Flight not found')) {
                 res.status(400).send(error.message);
            } else {
                 res.status(500).send('Error booking flight');
            }
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