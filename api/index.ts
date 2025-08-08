import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../server/storage';
import { insertWorkerSchema, insertCourseSchema, insertCertificationSchema } from '../shared/schema';

// Helper function to handle CORS
function setCorsHeaders(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Content-Type', 'application/json');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url, method } = req;
  const path = url?.replace('/api', '') || '';

  try {
    // Routes handling
    if (method === 'GET' && path === '/stats') {
      const workers = await storage.getAllWorkers();
      const courses = await storage.getAllCourses();
      const certifications = await storage.getAllCertifications();
      
      const expiringSoon = certifications.filter(cert => {
        if (!cert.expiryDate) return false;
        const expiry = new Date(cert.expiryDate);
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        return expiry <= thirtyDaysFromNow;
      });

      return res.json({
        totalWorkers: workers.length,
        activeCourses: courses.filter(c => c.isActive).length,
        totalCertifications: certifications.length,
        expiringSoon: expiringSoon.length
      });
    }

    if (method === 'GET' && path === '/workers') {
      const workers = await storage.getWorkersWithCertifications();
      return res.json(workers);
    }

    if (method === 'POST' && path === '/workers') {
      const { worker: workerData, certifications = [] } = req.body;
      const validatedWorkerData = insertWorkerSchema.parse(workerData);
      
      const processedWorkerData = {
        ...validatedWorkerData,
        dateOfExpiry: validatedWorkerData.dateOfExpiry ? new Date(validatedWorkerData.dateOfExpiry) : null,
        dateOfBirth: validatedWorkerData.dateOfBirth ? new Date(validatedWorkerData.dateOfBirth) : null,
      };
      
      const worker = await storage.createWorker(processedWorkerData);
      
      const createdCertifications = [];
      for (const cert of certifications) {
        const certificationData = {
          workerId: worker.id,
          courseId: cert.courseId,
          name: cert.name,
          certificateNumber: cert.certificateNumber,
          issuedDate: cert.issuedDate || new Date().toISOString(),
          expiryDate: cert.expiryDate || null,
          status: cert.status || 'active'
        };
        const validatedCertData = insertCertificationSchema.parse(certificationData);
        
        const processedCertData = {
          ...validatedCertData,
          issuedDate: validatedCertData.issuedDate ? new Date(validatedCertData.issuedDate) : new Date(),
          expiryDate: validatedCertData.expiryDate ? new Date(validatedCertData.expiryDate) : null,
        };
        const certification = await storage.createCertification(processedCertData);
        createdCertifications.push(certification);
      }
      
      return res.status(201).json({ worker, certifications: createdCertifications });
    }

    if (method === 'GET' && path === '/courses') {
      const courses = await storage.getAllCourses();
      return res.json(courses);
    }

    if (method === 'POST' && path === '/courses') {
      console.log('Creating course with data:', req.body);
      const validatedData = insertCourseSchema.parse(req.body);
      const course = await storage.createCourse(validatedData);
      console.log('Course created successfully:', course);
      return res.status(201).json(course);
    }

    if (method === 'GET' && path.startsWith('/certifications/expiring/')) {
      const days = parseInt(path.split('/')[3]);
      const certifications = await storage.getExpiringCertifications(days);
      return res.json(certifications);
    }

    if (method === 'GET' && path === '/certifications') {
      const certifications = await storage.getAllCertifications();
      return res.json(certifications);
    }

    if (method === 'POST' && path === '/certifications') {
      const validatedData = insertCertificationSchema.parse(req.body);
      const certification = await storage.createCertification(validatedData);
      return res.status(201).json(certification);
    }

    // Route not found
    return res.status(404).json({ message: `Route not found: ${method} ${path}` });

  } catch (error: any) {
    console.error('API Error:', error);
    
    // Handle Zod validation errors
    if (error.name === 'ZodError') {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    
    // Handle database unique constraint violations
    if (error.code === '23505') {
      return res.status(409).json({ 
        message: "Duplicate entry detected" 
      });
    }
    
    return res.status(500).json({ 
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
}