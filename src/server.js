import express from "express";
import morgan from "morgan";
import {db} from "./db/index.js";
import * as schema from "./db/schema.js";
import { eq } from "drizzle-orm"

const app = express();
app.use(morgan("dev"));
app.use(express.json());

const PORT = process.env.PORT || 3000;
app.get("/",(req,res)=>{
    res.json({message: "hello wordl"});
});
app.get("/products", async (req,res) => {
     const products = await  db.query.products.findMany();
     res.json(products);

});
app.post ("/products", async (req,res)=>{
    let {name,price} = req.body;
    if(!name || !price){
        return res.status(400).json({message: "el nombre y el precio es requerido"});
    }
    let product = await db.query.products.findFirst({
        where : eq(schema.products.name,name)
    });
    if ( product ){
        return res.status(409).json({message: "el producto ya existe"});
    }
    name = name.trim().toUpperCase();
    const products = await db.insert(schema.products).values(
        {name,price}
    ).returning();
    console.log("producto creado .i.", products);
    res.json(products);

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
		return res.status(400).json({ message: 'detalle de venta es requerido' });
	}
	let details = req.body.details;
	delete req.body.details;
	let sale;
	await db.transaction(async (savepoint) => {
		try {
			sale = await db.insert(sales).values(req.body).returning();
			if (!sale) {
				savepoint.rollback();
				return res.status(500).json({ message: 'Error al crear la venta' });
			}
			for (let i = 0; i < details.length; i++) {
				details[i].sale_id = sale.id;
				await db.insert(sales_detail).values(details[i]);
			}
		} catch(error) {
			savepoint.rollback();
			console.log(error);
			return res.status(500).json({ message: 'Error al crear la venta' });
		}
	});
	console.log('Venta creado correctamente');
	res.status(201).json(sale);
});


app.listen(PORT, () => {
    console.log("el servidor esta corriendo en mis bolas 3000")
})
