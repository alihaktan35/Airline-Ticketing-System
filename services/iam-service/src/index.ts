import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// Define the User interface
interface User {
    id: number;
    username: string;
    password?: string; // Make password optional as we might not want to send it back
    role: 'admin' | 'user';
    milesNumber?: string;
    milesPoints?: number;
}

// In-memory store for users with explicit typing
const users: User[] = [];

app.post('/register', async (req: Request, res: Response) => {
    try {
        const { username, password, role } = req.body;

        if (!username || !password || !role) {
            return res.status(400).send('Please provide username, password and role');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser: User = {
            id: users.length + 1,
            username,
            password: hashedPassword,
            role,
            milesNumber: `MS${Date.now()}`, // Generate a simple Miles&Smiles number
            milesPoints: 0 // Start with 0 points
        };

        users.push(newUser);

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


app.get('/', (req: Request, res: Response) => {
  res.send('IAM Service is running!');
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
