import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Category from "@/models/Category";
import Package from "@/models/Package";
import { CATEGORIES } from "@/data/categories";

export async function GET() {
  try {
    await connectToDatabase();
    let logs: string[] = [];

    for (const cat of CATEGORIES) {
      let dbCat = await Category.findOne({ title: cat.title });
      if (!dbCat) {
        dbCat = new Category({
          title: cat.title,
          slug: cat.slug,
          description: cat.description,
          image: cat.image,
          isActive: true,
        });
        await dbCat.save();
        logs.push(`Created ${cat.title}`);
      } else {
        dbCat.description = cat.description;
        dbCat.image = cat.image;
        dbCat.isActive = true;
        await dbCat.save();
        logs.push(`Updated ${cat.title}`);
      }

      for (const pkg of cat.packages) {
        let dbPkg = await Package.findOne({ title: pkg.title, categoryId: dbCat._id });
        if (!dbPkg) {
          dbPkg = new Package({
            title: pkg.title,
            description: pkg.description,
            amount: pkg.amount,
            categoryId: dbCat._id,
            isActive: true,
          });
          await dbPkg.save();
          logs.push(`Created Package ${pkg.title}`);
        } else {
          dbPkg.description = pkg.description;
          dbPkg.amount = pkg.amount;
          dbPkg.isActive = true;
          await dbPkg.save();
          logs.push(`Updated Package ${pkg.title}`);
        }
      }
    }

    const envCat = await Category.findOne({ title: "Environment" });
    if (envCat) {
      envCat.isActive = false;
      await envCat.save();
      logs.push("Deactivated Environment");
    }

    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
