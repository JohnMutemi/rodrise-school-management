# School Management System - Administrator Setup Guide

## Overview
This guide provides a systematic approach for new school administrators to set up and test the Rodrise School Management System.

## Prerequisites
- Database environment variables configured (DATABASE_URL, NEXTAUTH_SECRET)
- Node.js and npm/pnpm installed
- PostgreSQL database accessible

## Step-by-Step Setup Process

### Phase 1: Initial System Setup

#### 1. Database Migration and Setup
```bash
# Navigate to the project directory
cd rodrise-school-management

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Run the admin setup script
npm run setup-admin
```

The setup script will prompt you for:
- Admin user credentials (email, password, name)
- School information (name, address, phone, email)
- Automatically creates academic years, terms, classes, fee types, and payment methods

#### 2. Verify Database Setup
After running the setup script, verify that the following have been created:
- ✅ Admin user account
- ✅ School record
- ✅ Academic years (current and next)
- ✅ Terms (Term 1, 2, 3)
- ✅ Classes (Nursery through Class 8)
- ✅ Fee types (Tuition, Admission, Exam, etc.)
- ✅ Payment methods (Cash, Bank Transfer, Mobile Money, etc.)

### Phase 2: Administrative Configuration

#### 3. Start the Application
```bash
# Start the development server
npm run dev
```

Access the application at `http://localhost:3000`

#### 4. Login and Initial Dashboard Access
1. Navigate to `/auth/signin`
2. Login with the admin credentials you created
3. Access the dashboard at `/dashboard`

#### 5. Set Up Fee Structures
1. Go to **Dashboard > Fee Structure**
2. For each class, set up fee structures:
   - Select the class
   - Set amounts for each fee type (Tuition, Exam, etc.)
   - Specify term-wise breakdown if needed
   - Mark as active

**Testing Checklist for Fee Structures:**
- [ ] Create fee structure for at least 3 different classes
- [ ] Set different amounts for different fee types
- [ ] Verify term-wise breakdown calculations
- [ ] Test editing existing fee structures

### Phase 3: Student Management

#### 6. Add Students (Manual Entry)
1. Go to **Dashboard > Students**
2. Click "Add Student"
3. Fill in student details:
   - Admission number (must be unique)
   - Personal information
   - Parent/guardian details
   - Class assignment
   - Academic year

**Testing Checklist for Student Entry:**
- [ ] Add at least 5 students across different classes
- [ ] Test validation (duplicate admission numbers, required fields)
- [ ] Verify class assignment
- [ ] Test editing student information

#### 7. Bulk Student Import
1. Go to **Dashboard > Bulk Operations**
2. Download the sample template
3. Prepare student data in the required format
4. Upload and import students

**Sample data format for testing:**
```csv
admissionNumber,firstName,lastName,middleName,dateOfBirth,gender,className,parentName,parentPhone,parentEmail,address
2024001,John,Doe,,2015-05-15,MALE,Class 1,Jane Doe,+254712345678,jane.doe@email.com,123 Main St
2024002,Mary,Smith,,2014-08-20,FEMALE,Class 2,Bob Smith,+254723456789,bob.smith@email.com,456 Oak Ave
```

**Testing Checklist for Bulk Import:**
- [ ] Test successful import with valid data
- [ ] Test error handling with invalid data
- [ ] Verify duplicate detection
- [ ] Check auto-class creation for new classes

### Phase 4: Payment Processing

#### 8. Record Fee Payments
1. Go to **Dashboard > Payments**
2. Select a student
3. Record payment:
   - Choose payment method
   - Enter amount
   - Specify fee types being paid
   - Add reference number if applicable

**Testing Checklist for Payments:**
- [ ] Record cash payment
- [ ] Record bank transfer with reference
- [ ] Test partial payments
- [ ] Test overpayments
- [ ] Generate payment receipts

#### 9. Balance Management
1. Go to **Dashboard > Balances**
2. Review student fee balances
3. Check outstanding amounts
4. Generate balance statements

**Testing Checklist for Balances:**
- [ ] View individual student balances
- [ ] Generate class-wise balance reports
- [ ] Test balance calculations after payments
- [ ] Export balance data

### Phase 5: Reporting and Analysis

#### 10. Generate Reports
1. Go to **Dashboard > Reports**
2. Generate different report types:
   - Student enrollment by class
   - Fee collection summaries
   - Outstanding balances
   - Payment history

**Testing Checklist for Reports:**
- [ ] Generate enrollment report
- [ ] Create fee collection summary
- [ ] Export reports to different formats
- [ ] Test date range filtering

### Phase 6: System Administration

#### 11. User Management (Future Feature)
- Create additional user accounts for teachers, accountants
- Set up role-based permissions
- Test different access levels

#### 12. Data Backup and Maintenance
```bash
# Backup database (example for PostgreSQL)
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Reset database if needed (CAUTION: This deletes all data)
npm run db:reset
```

## Testing Scenarios

### Scenario 1: New Academic Year Setup
1. Create new academic year
2. Set up terms for the new year
3. Create/update fee structures
4. Migrate students or add new ones
5. Test payment processing for new year

### Scenario 2: Mid-Term Student Transfer
1. Add a new student mid-term
2. Set up prorated fee structure
3. Record initial payment
4. Generate balance statement

### Scenario 3: Bulk Operations
1. Import 50+ students using bulk import
2. Process multiple payments in batch
3. Generate comprehensive reports
4. Export data for external use

### Scenario 4: Error Recovery
1. Test with invalid data entries
2. Recover from failed operations
3. Verify data integrity
4. Test system resilience

## Common Issues and Solutions

### Database Connection Issues
- Verify DATABASE_URL environment variable
- Check PostgreSQL service status
- Ensure database exists and is accessible

### Authentication Problems
- Verify NEXTAUTH_SECRET is set
- Check user credentials
- Clear browser cache and cookies

### Permission Errors
- Ensure user has ADMIN role
- Check database user permissions
- Verify file system permissions for uploads

### Performance Issues
- Monitor database query performance
- Check server resource usage
- Optimize large data imports

## Best Practices

1. **Data Validation**: Always validate data before import/entry
2. **Regular Backups**: Schedule automatic database backups
3. **User Training**: Train staff on proper system usage
4. **Documentation**: Maintain records of system changes
5. **Testing**: Test new features in development environment first

## Support and Maintenance

### Regular Maintenance Tasks
- [ ] Weekly database backups
- [ ] Monthly system updates
- [ ] Quarterly user access review
- [ ] Annual data archival

### Monitoring
- Monitor system performance
- Track user activity
- Review error logs
- Check database health

## Next Steps

After completing this setup guide:
1. Train additional staff members
2. Set up automated backups
3. Plan for system scaling
4. Consider additional feature requirements
5. Establish ongoing maintenance procedures

---

**Important Notes:**
- Always test new configurations in a development environment first
- Keep regular backups of your database
- Document any custom configurations or modifications
- Monitor system performance and user feedback regularly

