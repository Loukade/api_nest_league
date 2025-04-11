import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
  app.enableCors({
    origin: '*', // Autoriser uniquement votre frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Méthodes autorisées
    credentials: true, // Autoriser les cookies et les informations d'identification
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
