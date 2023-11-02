import { NextResponse } from 'next/server';
import { NextApiRequest } from 'next';

import prismadb from '@/lib/prismadb';

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
  
  export async function OPTIONS(req: Request, res: Response) {
    return new NextResponse(null, { headers: corsHeaders });
  }
  

export async function GET(req: NextApiRequest, res: Response) {
    const { size, color, category } = req.query;
  
    try {
      let products;
  
      if (size && color && category) {
        // Fetch products based on size, color, and category
        products = await prismadb.product.findMany({
          where: {
            size: { name: size as string  },
            color: { name: color as string },
            category: { name: category as string  },
          },
        });
      } else if (size && color) {
        // Fetch products based on size and color
        products = await prismadb.product.findMany({
          where: {
            size: { name: size as string  },
            color: { name: color as string  },
          },
        });
      } else if (category) {
        // Fetch products based on category
        products = await prismadb.product.findMany({
          where: {
            category: { name: category as string  },},
          });
      } else {
        // Fetch all products if no parameters are specified
        products = await prismadb.product.findMany();
      }
  
      return NextResponse.json(products, { headers: corsHeaders });
    } catch (error) {
      console.error('[PRODUCTS_GET]', error);
      return new NextResponse("Internal error", { status: 500 });
    }
  }
  