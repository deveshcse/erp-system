import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { User } from "../models/user.model.js";
import { Company } from "../models/company.model.js";
import { Employee } from "../models/employee.model.js";
import { Lead } from "../models/lead.model.js";
import { Quotation } from "../models/quotation.model.js";
import { Invoice } from "../models/invoice.model.js";
import { Task } from "../models/task.model.js";
import { Attendance } from "../models/attendance.model.js";
import { Payslip } from "../models/payslip.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for seeding...");

    console.log("Clearing existing data...");
    await User.deleteMany({});
    await Company.deleteMany({});
    await Employee.deleteMany({});
    await Lead.deleteMany({});
    await Quotation.deleteMany({});
    await Invoice.deleteMany({});
    await Task.deleteMany({});
    await Attendance.deleteMany({});
    await Payslip.deleteMany({});

    // 1. Create SUPER_ADMIN
    const superAdminEmail = "admin@erp.com";
    const superAdmin = await User.create({
      name: "Super Admin",
      email: superAdminEmail,
      password: "adminpassword123",
      role: "SUPER_ADMIN",
    });
    console.log("SUPER_ADMIN created: admin@erp.com / adminpassword123");

    const statuses = ["NEW", "CONTACTED", "NEGOTIATION", "CLOSED", "LOST"];
    const priorities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
    const taskStatuses = ["PENDING", "IN_PROGRESS", "COMPLETED"];
    const departments = ["IT", "HR", "Sales", "Marketing", "Finance"];

    // 2. Create 10 Companies and 10 Company Admins
    for (let i = 1; i <= 10; i++) {
        const companyAdminEmail = `admin${i}@company${i}.com`;
        const companyEmail = `contact@company${i}.com`;
        
        const companyAdmin = await User.create({
            name: `Admin Company ${i}`,
            email: companyAdminEmail,
            password: "password123",
            role: "COMPANY_ADMIN",
            companyId: new mongoose.Types.ObjectId(), // Placeholder
        });

        const company = await Company.create({
            companyName: `Company ${i} Ltd`,
            companyEmail: companyEmail,
            companyAddress: `${i}00 Business Road, Sector ${i}`,
            contactNumber: `987654321${i-1}`,
            gstNumber: `${i}${i}AAAAA0000A1Z${i}`,
            adminUserId: companyAdmin._id,
        });

        companyAdmin.companyId = company._id;
        await companyAdmin.save();
        console.log(`Created Company ${i} and Admin ${companyAdminEmail}`);

        const companyEmployees = [];

        // 3. Create 10 Employees for each Company (Total 100)
        for (let j = 1; j <= 10; j++) {
            const employeeNum = (i - 1) * 10 + j;
            const employeeEmail = `employee${employeeNum}@company${i}.com`;
            
            const user = await User.create({
                name: `Employee ${employeeNum}`,
                email: employeeEmail,
                password: "password123",
                role: "EMPLOYEE",
                companyId: company._id,
            });

            const employee = await Employee.create({
                employeeId: `EMP${employeeNum.toString().padStart(3, '0')}`,
                fullName: `Employee ${employeeNum}`,
                email: employeeEmail,
                phoneNumber: `9000000${employeeNum.toString().padStart(3, '0')}`,
                department: departments[j % departments.length],
                designation: j % 2 === 0 ? "Senior Developer" : "Junior Associate",
                joiningDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 120), // 4 months ago
                salary: 30000 + (j * 1000),
                status: "ACTIVE",
                companyId: company._id,
                userId: user._id,
            });
            companyEmployees.push(employee);

            // 4. Seed Attendance (Last 30 days)
            for (let k = 0; k < 30; k++) {
                const date = new Date();
                date.setDate(date.getDate() - k);
                date.setHours(0, 0, 0, 0);
                
                // Skip weekends for some variety, or just seed all
                if (date.getDay() !== 0 && date.getDay() !== 6) {
                    await Attendance.create({
                        employeeId: employee._id,
                        date: date,
                        status: Math.random() > 0.1 ? "PRESENT" : "ABSENT",
                        companyId: company._id,
                    });
                }
            }

            // 5. Seed Payslips (Last 2 months)
            for (let m = 1; m <= 2; m++) {
                const monthDate = new Date();
                monthDate.setMonth(monthDate.getMonth() - m);
                const monthStr = `${monthDate.getFullYear()}-${(monthDate.getMonth() + 1).toString().padStart(2, '0')}`;
                
                await Payslip.create({
                    employeeId: employee._id,
                    month: monthStr,
                    basicSalary: employee.salary,
                    workingDays: 22,
                    netSalary: employee.salary,
                    companyId: company._id,
                });
            }
        }

        // 6. Seed Leads (20 per company)
        for (let l = 1; l <= 20; l++) {
            await Lead.create({
                customerName: `Customer ${i}-${l}`,
                companyName: `Client Corp ${l}`,
                phone: `9111111${i}${l % 10}`,
                email: `customer${i}_${l}@gmail.com`,
                status: statuses[l % statuses.length],
                companyId: company._id,
            });
        }

        // 7. Seed Quotations (5 per company)
        for (let q = 1; q <= 5; q++) {
            const amount = 5000 + (q * 1000);
            await Quotation.create({
                customerName: `Customer ${i}-${q}`,
                items: [{ name: "Support Service", quantity: q, price: 1000 }],
                totalAmount: amount,
                validityDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
                companyId: company._id,
            });
        }

        // 8. Seed Invoices (10 per company)
        for (let inv = 1; inv <= 10; inv++) {
            const amount = 3000 + (inv * 500);
            await Invoice.create({
                invoiceNumber: `INV-${i}-${inv.toString().padStart(3, '0')}`,
                customerName: `Customer ${i}-${inv}`,
                items: [{ name: "Inventory Item", quantity: 2, price: amount / 2 }],
                total: amount,
                paymentStatus: inv % 2 === 0 ? "PAID" : "PENDING",
                companyId: company._id,
            });
        }

        // 9. Seed Tasks (20 per company)
        for (let t = 1; t <= 20; t++) {
            const randomEmployee = companyEmployees[Math.floor(Math.random() * companyEmployees.length)];
            await Task.create({
                title: `Task ${i}-${t}: ${["Audit", "Update", "fix", "Research"][t % 4]}`,
                description: `Synthetic task description for company ${i}`,
                assignedTo: randomEmployee._id,
                assignedBy: companyAdmin._id,
                deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * (t % 10)),
                priority: priorities[t % priorities.length],
                status: taskStatuses[t % taskStatuses.length],
                companyId: company._id,
            });
        }
        console.log(`  Seeded synthetic data for Company ${i} (Leads, Tasks, Invoices, etc.)`);
    }

    console.log("\nSeeding completed successfully!");

  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    await mongoose.connection.close();
  }
};

seedDatabase();
