import { Web5 } from "@web5/api";

/*
Needs globalThis.crypto polyfill. 
This is *not* the crypto you're thinking of.
It's the original crypto...CRYPTOGRAPHY.
*/
import { webcrypto } from "node:crypto";

import express from "express";

// @ts-ignore
if (!globalThis.crypto) globalThis.crypto = webcrypto;

//connect
const { web5, did: aliceDid } = await Web5.connect();

const app = express();

app.use(express.json());

app.listen(3000, () => {
    console.log("API is running");
});

app.get("/", function (req, res) {
    res.send(aliceDid);
});

app.post("/signup", async (req, res) => {
    try {
        const { record } = await web5.dwn.records.create({
            data: req.body,
            message: {
                dataFormat: "application/json",
            },
        });

        res.status(200).json(record)

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get("/info", async (req, res) => {
    try {
        const readResult = await record.data.json();

        res.status(200).json(readResult)

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
