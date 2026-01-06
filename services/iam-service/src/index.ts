import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import axios from 'axios';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3002;
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3003';

app.use(cors());
app.use(express.json());

// Define the User interface
interface User {
    id: number;
    username: string;
    email: string;
    password?: string; // Make password optional as we might not want to send it back
    role: 'admin' | 'user';
    milesNumber?: string;
    milesPoints?: number;
}

// In-memory store for users with explicit typing
const users: User[] = [];

app.post('/register', async (req: Request, res: Response) => {
    try {
        const { username, password, role, email } = req.body;

        if (!username || !password || !role || !email) {
            return res.status(400).send('Please provide username, password, role, and email');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser: User = {
            id: users.length + 1,
            username,
            email,
            password: hashedPassword,
            role,
            milesNumber: `MS${Date.now()}`, // Generate a simple Miles&Smiles number
            milesPoints: 0 // Start with 0 points
        };

        users.push(newUser);
        
        // Asynchronously send a welcome email by calling the notification service.
        // In a real application, this would be done by publishing a message to a queue (e.g., RabbitMQ, SQS).
        axios.post(`${NOTIFICATION_SERVICE_URL}/send-welcome-email`, {
            email: newUser.email,
            username: newUser.username,
        }).catch(error => {
            // Log the error, but don't fail the registration if the email fails.
            console.error('Failed to send welcome email:', error.response?.data);
        });

        res.status(201).send('User created successfully');
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

app.post('/login', async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;

        const user = users.find(u => u.username === username);
        if (!user || !user.password) {
            return res.status(400).send('Invalid credentials');
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).send('Invalid credentials');
        }

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET as string, {
            expiresIn: '1h'
        });

        res.status(200).json({ token });
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

// Endpoint to get a user's profile
app.get('/users/:id', (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);
    const user = users.find(u => u.id === userId);

    if (!user) {
        return res.status(404).send('User not found');
    }

    // Don't send the password back
    const { password, ...userProfile } = user;
    res.status(200).json(userProfile);
});

// Endpoint to update a user's points
app.post('/users/:id/update-points', (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);
    const { points } = req.body;

    if (points === undefined) {
        return res.status(400).send('Please provide points to add/subtract.');
    }

    const user = users.find(u => u.id === userId);

    if (!user) {
        return res.status(404).send('User not found');
    }

    if (user.milesPoints === undefined) {
        user.milesPoints = 0;
    }

    user.milesPoints += points;

    res.status(200).json({ message: 'Points updated successfully', user });
});

// --- Partner Service ---

// Middleware to authenticate partners via API Key
const authenticatePartner = (req: Request, res: Response, next: Function) => {
    const apiKey = req.header('x-api-key');
    if (apiKey && apiKey === process.env.PARTNER_API_KEY) {
        next();
    } else {
        res.status(401).send('Unauthorized: Invalid API Key');
    }
};

// Endpoint for partners to add miles
app.post('/partners/add-miles', authenticatePartner, (req: Request, res: Response) => {
    const { milesNumber, points } = req.body;

    if (!milesNumber || points === undefined) {
        return res.status(400).send('Please provide milesNumber and points.');
    }

    const user = users.find(u => u.milesNumber === milesNumber);

    if (!user) {
        return res.status(404).send('User with that Miles&Smiles number not found.');
    }

    if (user.milesPoints === undefined) {
        user.milesPoints = 0;
    }

    user.milesPoints += points;

    res.status(200).json({ message: `Successfully added ${points} points to user ${user.username}.` });
});


app.get('/', (req: Request, res: Response) => {
  res.send('IAM Service is running!');
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
