import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import nodemailer from 'nodemailer';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

app.post('/send-welcome-email', async (req: Request, res: Response) => {
    const { email, username } = req.body;
    if (!email || !username) {
        return res.status(400).send('Missing `email` or `username`.');
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: email,
        subject: 'Welcome to the Airline Ticketing System!',
        text: `Hi ${username},\n\nWelcome aboard! We are excited to have you with us.\n\nHappy flying!\n\nThe Airline Team`,
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).send('Welcome email sent successfully');
    } catch (error) {
        console.error('Error sending welcome email: ', error);
        res.status(500).send('Error sending welcome email');
    }
});

app.post('/send-email', async (req: Request, res: Response) => {
    const { to, subject, text } = req.body;

    if (!to || !subject || !text) {
        return res.status(400).send('Missing `to`, `subject`, or `text`');
    }
    
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.GMAIL_USER,
        to,
        subject,
        text,
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).send('Email sent successfully');
    } catch (error) {
        console.error('Error sending email: ', error);
        res.status(500).send('Error sending email');
    }
});


app.get('/', (req: Request, res: Response) => {
  res.send('Notification Service is running!');
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
