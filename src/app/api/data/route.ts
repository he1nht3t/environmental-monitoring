import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Test database connection
async function testDatabaseConnection() {
  try {
    await prisma.$connect();
    return true;
  } catch (error) {
    return false;
  }
}

// Validate the data structure
function isValidEnvironmentalData(data: any): boolean {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.temperature === 'number' &&
    typeof data.humidity === 'number' &&
    typeof data.soundIntensity === 'number' &&
    typeof data.rainIntensity === 'number' &&
    typeof data.co === 'number' &&
    typeof data.co2 === 'number' &&
    typeof data.smoke === 'number' &&
    typeof data.nh3 === 'number' &&
    typeof data.lpg === 'number' &&
    typeof data.benzene === 'number' &&
    typeof data.latitude === 'number' &&
    typeof data.longitude === 'number'
  );
}

function generateMockData() {
  return {
    temperature: Number((20 + Math.random() * 10).toFixed(2)), // 20-30°C
    humidity: Number((40 + Math.random() * 30).toFixed(2)), // 40-70%
    soundIntensity: Number((30 + Math.random() * 40).toFixed(2)), // 30-70 dB
    rainIntensity: Number((Math.random() * 10).toFixed(2)), // 0-10 mm/h
    co: Number((0.5 + Math.random() * 4.5).toFixed(2)), // 0.5-5 ppm
    co2: Number((350 + Math.random() * 150).toFixed(2)), // 350-500 ppm
    smoke: Number((Math.random() * 5).toFixed(2)), // 0-5 ppm
    nh3: Number((Math.random() * 25).toFixed(2)), // 0-25 ppm
    lpg: Number((Math.random() * 2).toFixed(2)), // 0-2 ppm
    benzene: Number((Math.random() * 0.1).toFixed(2)), // 0-0.1 ppm
    latitude: 1.3521, // Singapore latitude
    longitude: 103.8198 // Singapore longitude
  };
}

export async function GET() {
  try {
    // Test database connection first
    const isConnected = await testDatabaseConnection();
    if (!isConnected) {
      throw new Error('Failed to connect to the database');
    }

    const mockData = generateMockData();

    if (!mockData || !isValidEnvironmentalData(mockData)) {
      throw new Error('Invalid mock data structure');
    }

    const environmentalData = await prisma.environmentalData.create({
      data: mockData,
    });
    return NextResponse.json(environmentalData);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to process environmental data', details: errorMessage },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}