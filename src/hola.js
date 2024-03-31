import { db } from './db/index.js';
import express from 'express';
import morgan from 'morgan';
import { products, sales, sales_detail } from './db/schema.js';
import { eq } from 'drizzle-orm';

const app = express();
app.use(morgan('dev'));
app.use(express.json());

app.get('/products', async (req, res) => {
	const products = await db.query.products.findMany();
	res.json(products);
});

app.post('/products', async (req, res) => {
	const product = await db.query.products.findFirst({
		where: eq(products.name, req.body.name),
	});
	if (product) {
		return res.status(400).json({ message: 'Product already exists' });
	}
	const created = await db.insert(products).values(req.body).returning();
	console.log(created);
	console.log('Product created successfully');
	res.status(201).json(created);
});

app.delete('/products/:id', async (req, res) => {
	const id = parseInt(req.params.id);
	await db.query.products.delete(id);
	res.status(204).send();
  });

app.get('/sales', async (req, res) => {
	const sales = await db.query.sales.findMany();
	res.json(sales);
});

app.post('/sales', async (req, res) => {
	if (!req.body.details || req.body.details.length === 0) {
		return res.status(400).json({ message: 'Sale details are required' });
	}
	let details = req.body.details;
	delete req.body.details;
	let sale;
	await db.transaction(async (savepoint) => {
		try {
			sale = await db.insert(sales).values(req.body).returning();
			if (!sale) {
				savepoint.rollback();
				return res.status(500).json({ message: 'Error creating sale' });
			}
			for (let i = 0; i < details.length; i++) {
				details[i].sale_id = sale.id;
				await db.insert(sales_detail).values(details[i]);
			}
		} catch(error) {
			savepoint.rollback();
			console.log(error);
			return res.status(500).json({ message: 'Error creating sale' });
		}
	});
	console.log('Sale created successfully');
	res.status(201).json(sale);
});

app.listen(process.env.PORT, () => {
	console.log('Server is running on http://localhost:3000');
});
