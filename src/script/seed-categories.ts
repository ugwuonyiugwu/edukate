 // TODO: create a script to add categories

import { db } from "@/db";
import { categories } from "@/db/schema";

 const categoryName = [
  "car and vehicle",
  "Comedy",
  "Education",
  "Gaming",
  "Entertainment",
  "Film and animation",
  "How-to ant style",
  "Music",
  "News and politics",
  "People and blog",
  "Pets and animal",
  "Science and technology",
  "Sport",
  "Travel and events",
 ];

  async function main() {
    try {
      const value = categoryName.map((name) => ({
        name,
        description: `video related to ${name}`
      }))
      await db.insert(categories).values(value);
      console.log("categories seeded successfully!");
      
    } catch (error) {
      console.error("Error seeding categories:", error);
      process.exit(1);
      
    }
  }
  main();