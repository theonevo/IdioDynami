import { Web5 } from "@web5/api";

/*
Needs globalThis.crypto polyfill. 
This is *not* the crypto you're thinking of.
It's the original crypto...CRYPTOGRAPHY.
*/
import { webcrypto } from "node:crypto";

import express, { response } from "express";

// @ts-ignore
if (!globalThis.crypto) globalThis.crypto = webcrypto;

//connect
const { web5, did: aliceDid } = await Web5.connect();

//initialize express
const app = express();

app.use(express.json());


//create user Schema
const schema = {
    context: "https://schema.org/",
    type: "Person",
    get uri() {
      return this.context + this.type;
    },
  };

  let people = [
    {
        "@context": schema.context,
        "@type": schema.type,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Seattle",
          "addressRegion": "WA",
          "postalCode": "98052",
          "streetAddress": "20341 Whitworth Institute 405 N. Whitworth"
        },
        "colleague": [
          "http://www.xyz.edu/students/alicejones.html",
          "http://www.xyz.edu/students/bobsmith.html"
        ],
        "email": "mailto:jane-doe@xyz.edu",
        "image": "janedoe.jpg",
        "jobTitle": "Professor",
        "name": "Jane Doe",
        "telephone": "(425) 123-4567",
        "url": "http://www.janedoe.com"
      }
  
]

//Query People (search for DWN records)
async function getPeople() {
    let { records } = await web5.dwn.records.query({
      message: {
        filter: {
          schema: schema.uri,
        },
      },
      dateSort: "createdAscending",
    });
    //console.log(records)
    return records;
  }

//checks if user already exists ()
async function isUserPresent(person) {
    for (let record of existingPeople) {
      let userData = await record.data.json();
      let email = userData.email;
  
      if (email === person.email) {
        return true;
      }
    }
    return false;
  }

app.listen(3000, () => {
    console.log("API is running on port 3000");
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

        const readResult = await record.data.json();

        res.status(200).json(readResult)

        //res.status(200).json(record)
        // console.log(req.body)
        // res.status(200).json(req.body)

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post("/addUser", async (req, res) => {
    try {
        const { email, password, name } = req.body;
        const userData = {
        "@context": schema.context,
        "@type": schema.type,
        "colleague": [
          "http://www.xyz.edu/students/alicejones.html",
          "http://www.xyz.edu/students/bobsmith.html"
        ],
        "email": email,
        "name": name,
        "telephone": "(425) 123-4567",
        "url": "http://www.janedoe.com"
        }
          console.log(email)
          //res.status(200).json(userData)
        
        //for (const userData of people) {
            let personExists = await isUserPresent(userData);
            if (personExists) {
              console.log(`User with ${userData.email} already exists`);

              res.status(500).json({ message: `Error adding user for ${userData.email}: User exist already`  });

            } else {
              const response = await web5.dwn.records.create({
                data: userData,
                message: {
                  schema: schema.uri,
                  dataFormat: "application/json",
                  published: true,
                },
              });
        
              if (response.status.code === 202) {
                console.log(` ${userData.email} added successfully`);
                res.status(202).json({ message: ` ${userData.email} added successfully` });
              } else {
                console.log(`${response.status}. Error adding user for ${userData.email}`);
                res.status(500).json({ message: `Error adding user for ${userData.email}` });
              }
            }

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get("/info", async (req, res) => {
    try {
        var readResult = null
        const response = await web5.dwn.records.query({
            message: {
              filter: {
                dataFormat: 'application/json',
              },
            },
          });
          
          // Loop through returned records and print text from each
          response.records.forEach(async record => {
            console.log(await record.data.json());
            readResult = await record.data.json();
          });


        res.status(200).json(response)

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get("/people", async (req, res) => {
    try {
        let { records } = await web5.dwn.records.query({
            message: {
              filter: {
                schema: schema.uri,
              },
            },
            dateSort: "createdAscending",
          });


        res.status(200).json(records)

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});





let existingPeople = await getPeople();