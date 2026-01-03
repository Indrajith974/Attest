/**
 * Claim Templates
 * Pre-defined templates for common claim types
 */

export const CLAIM_TEMPLATES = [
    // Residence Templates
    {
        id: 'residence',
        name: 'Proof of Residence',
        category: 'Residence',
        titleTemplate: 'Residence at [Address]',
        descriptionTemplate: `I have been residing at [Address] since [Date].

This is my primary residence where I:
- Receive mail and correspondence
- Pay utilities (electricity, water, etc.)
- Am registered for local services

I can provide utility bills, rental agreement, or other documents as evidence.`,
        suggestedEvidence: ['Utility bill', 'Rental agreement', 'Bank statement with address', 'Voter ID']
    },
    {
        id: 'rental',
        name: 'Rental/Lease Agreement',
        category: 'Residence',
        titleTemplate: 'Rental at [Property Address]',
        descriptionTemplate: `I am a tenant at [Property Address] under a rental/lease agreement.

Tenancy Details:
- Landlord: [Landlord Name]
- Monthly Rent: ₹[Amount]
- Lease Duration: [Start Date] to [End Date]
- Security Deposit: ₹[Amount]

The property is used for residential purposes.`,
        suggestedEvidence: ['Rent agreement', 'Rent receipts', 'Bank transfer proof', 'Landlord contact']
    },
    {
        id: 'address-change',
        name: 'Change of Address',
        category: 'Residence',
        titleTemplate: 'Address Change from [Old Address] to [New Address]',
        descriptionTemplate: `I have moved from [Old Address] to [New Address] on [Date].

Previous Address: [Old Address]
New Address: [New Address]
Reason for Move: [Job transfer/Family/Personal]

I have updated my address in relevant documents and services.`,
        suggestedEvidence: ['Old utility bill', 'New utility bill', 'Moving company receipt']
    },

    // Employment Templates
    {
        id: 'employment',
        name: 'Proof of Employment',
        category: 'Employment',
        titleTemplate: 'Employment at [Company Name]',
        descriptionTemplate: `I am/was employed at [Company Name] as [Job Title].

Employment Details:
- Position: [Job Title]
- Department: [Department]
- Employment Type: Full-time/Part-time/Contract
- Reporting Manager: [Name]

My responsibilities include/included [brief description of duties].`,
        suggestedEvidence: ['Offer letter', 'ID card', 'Pay slip', 'Experience letter']
    },
    {
        id: 'salary',
        name: 'Salary/Income Proof',
        category: 'Employment',
        titleTemplate: 'Income of ₹[Amount] from [Company Name]',
        descriptionTemplate: `I receive a monthly salary/income from [Company Name].

Income Details:
- Gross Monthly Salary: ₹[Amount]
- Net Monthly Salary: ₹[Amount]
- Payment Mode: Bank Transfer/Cheque
- Bank Account: [Bank Name] - [Last 4 digits]

This income has been consistent since [Date].`,
        suggestedEvidence: ['Salary slips', 'Bank statements', 'Form 16', 'IT returns']
    },
    {
        id: 'freelance',
        name: 'Freelance/Self-Employment',
        category: 'Employment',
        titleTemplate: 'Freelance Work as [Profession]',
        descriptionTemplate: `I work as a freelance [Profession/Consultant].

Business Details:
- Nature of Work: [Description]
- Primary Clients: [Client names or types]
- Average Monthly Income: ₹[Amount]
- GST Registration: [Yes/No - Number if applicable]

I have been working independently since [Date].`,
        suggestedEvidence: ['Client contracts', 'Invoices', 'Bank statements', 'GST returns']
    },
    {
        id: 'experience',
        name: 'Work Experience',
        category: 'Employment',
        titleTemplate: '[X] Years Experience at [Company Name]',
        descriptionTemplate: `I worked at [Company Name] for [X] years.

Experience Details:
- Position: [Job Title]
- Duration: [Start Date] to [End Date]
- Key Responsibilities:
  • [Responsibility 1]
  • [Responsibility 2]
  • [Responsibility 3]
- Achievements: [Notable achievements]

Reason for leaving: [Reason]`,
        suggestedEvidence: ['Experience letter', 'Relieving letter', 'Offer letter', 'Pay slips']
    },

    // Education Templates
    {
        id: 'education',
        name: 'Proof of Education',
        category: 'Education',
        titleTemplate: 'Education at [Institution Name]',
        descriptionTemplate: `I studied at [Institution Name] pursuing [Degree/Course].

Education Details:
- Degree/Course: [Name]
- Stream/Major: [Subject]
- Duration: [Start Year] to [End Year]
- Final Grade/Percentage: [Score]

I successfully completed/am currently pursuing this program.`,
        suggestedEvidence: ['ID card', 'Marksheet', 'Admission letter', 'Bonafide certificate']
    },
    {
        id: 'degree',
        name: 'Degree Completion',
        category: 'Education',
        titleTemplate: '[Degree Name] from [University Name]',
        descriptionTemplate: `I have completed [Degree Name] from [University Name].

Degree Details:
- Degree: [B.Tech/B.Com/M.A./etc.]
- Specialization: [Subject]
- University: [University Name]
- Year of Passing: [Year]
- Grade/CGPA: [Score]

Degree was awarded on [Convocation Date].`,
        suggestedEvidence: ['Degree certificate', 'Final marksheet', 'Convocation photo', 'University transcript']
    },
    {
        id: 'certification',
        name: 'Professional Certification',
        category: 'Education',
        titleTemplate: '[Certification Name] Certified',
        descriptionTemplate: `I have obtained [Certification Name] certification.

Certification Details:
- Certification: [Name]
- Issuing Organization: [Org Name]
- Date Obtained: [Date]
- Validity: [Valid until Date / Lifetime]
- Credential ID: [ID if applicable]

This certification validates my expertise in [Domain].`,
        suggestedEvidence: ['Certificate', 'Digital badge', 'Verification link']
    },
    {
        id: 'school',
        name: 'School Education',
        category: 'Education',
        titleTemplate: '[Class X/XII] from [School Name]',
        descriptionTemplate: `I completed [Class X/XII] from [School Name].

School Details:
- School: [School Name]
- Board: [CBSE/ICSE/State Board]
- Year of Passing: [Year]
- Percentage/CGPA: [Score]
- Subjects: [List of subjects]

School was located at [City, State].`,
        suggestedEvidence: ['Marksheet', 'TC/Transfer Certificate', 'School leaving certificate']
    },

    // Dependency Templates
    {
        id: 'dependency',
        name: 'Proof of Dependency',
        category: 'Dependency',
        titleTemplate: '[Dependent Name] - Dependency on [Guardian Name]',
        descriptionTemplate: `[Dependent Name] is a dependent of [Guardian Name].

Relationship: [Parent/Guardian/Spouse/etc.]

The dependent:
- Lives with the guardian at [Address]
- Is financially supported by the guardian
- [Additional relevant details]`,
        suggestedEvidence: ['Birth certificate', 'Ration card', 'Joint bank statement', 'School records']
    },
    {
        id: 'family-member',
        name: 'Family Relationship',
        category: 'Dependency',
        titleTemplate: '[Relationship] of [Family Member Name]',
        descriptionTemplate: `I am the [Relationship] of [Family Member Name].

Family Details:
- My Name: [Your Name]
- Family Member: [Their Name]
- Relationship: [Father/Mother/Spouse/Child/Sibling]
- Date of Birth: [Their DOB]

We have been living together since [Date] at [Address].`,
        suggestedEvidence: ['Birth certificate', 'Marriage certificate', 'Ration card', 'Passport']
    },
    {
        id: 'marriage',
        name: 'Marriage Proof',
        category: 'Dependency',
        titleTemplate: 'Marriage of [Spouse 1] and [Spouse 2]',
        descriptionTemplate: `[Spouse 1 Name] and [Spouse 2 Name] are legally married.

Marriage Details:
- Date of Marriage: [Date]
- Place of Marriage: [City, State]
- Type: [Court Marriage/Religious Ceremony]
- Marriage Registration: [Registration Number if applicable]

We have been married for [X] years.`,
        suggestedEvidence: ['Marriage certificate', 'Wedding photos', 'Joint bank account', 'Wedding invitation']
    },

    // Other Templates
    {
        id: 'medical',
        name: 'Medical/Health Condition',
        category: 'Other',
        titleTemplate: 'Medical Condition: [Condition Name]',
        descriptionTemplate: `I have been diagnosed with [Medical Condition].

Medical Details:
- Condition: [Name]
- Diagnosed By: Dr. [Name] at [Hospital]
- Date of Diagnosis: [Date]
- Treatment: [Ongoing/Completed]
- Current Status: [Stable/Under treatment]

I am under regular medical supervision.`,
        suggestedEvidence: ['Medical reports', 'Doctor\'s prescription', 'Hospital bills', 'Disability certificate']
    },
    {
        id: 'vehicle',
        name: 'Vehicle Ownership',
        category: 'Other',
        titleTemplate: 'Owner of [Vehicle Type] - [Registration Number]',
        descriptionTemplate: `I am the registered owner of [Vehicle Type].

Vehicle Details:
- Type: [Car/Bike/Scooter]
- Make & Model: [Brand Model]
- Registration Number: [XX-00-XX-0000]
- Year of Purchase: [Year]
- Purchased From: [Dealer/Previous owner]

The vehicle is registered in my name with the RTO.`,
        suggestedEvidence: ['RC book', 'Insurance', 'Purchase invoice', 'Pollution certificate']
    },
    {
        id: 'property',
        name: 'Property Ownership',
        category: 'Other',
        titleTemplate: 'Owner of Property at [Address]',
        descriptionTemplate: `I am the legal owner of property located at [Address].

Property Details:
- Type: [Flat/House/Land/Commercial]
- Address: [Full Address]
- Area: [X] sq. ft.
- Purchase Date: [Date]
- Registration: [Sub-registrar office, Registration Number]

The property is registered in my name.`,
        suggestedEvidence: ['Sale deed', 'Property tax receipt', 'Electricity bill', 'Encumbrance certificate']
    },
    {
        id: 'bank-account',
        name: 'Bank Account Proof',
        category: 'Other',
        titleTemplate: 'Account Holder at [Bank Name]',
        descriptionTemplate: `I hold a bank account with [Bank Name].

Account Details:
- Bank: [Bank Name]
- Branch: [Branch Name, City]
- Account Type: [Savings/Current]
- Account Number: [Last 4 digits: XXXX]
- Account Since: [Year]

This account is active and in good standing.`,
        suggestedEvidence: ['Bank statement', 'Passbook', 'Account opening form', 'Cheque book']
    },
    {
        id: 'business',
        name: 'Business Ownership',
        category: 'Other',
        titleTemplate: 'Owner of [Business Name]',
        descriptionTemplate: `I am the owner/partner of [Business Name].

Business Details:
- Name: [Business Name]
- Type: [Sole Proprietorship/Partnership/Pvt Ltd]
- Nature: [Type of business]
- GST Number: [If applicable]
- Established: [Year]
- Location: [Address]

The business is registered and operational.`,
        suggestedEvidence: ['GST certificate', 'Shop license', 'Partnership deed', 'Bank statement']
    },
    {
        id: 'travel',
        name: 'Travel/Visit Proof',
        category: 'Other',
        titleTemplate: 'Visit to [Location] on [Date]',
        descriptionTemplate: `I visited [Location] on [Date/Period].

Travel Details:
- Destination: [City/Country]
- Purpose: [Tourism/Business/Personal]
- Duration: [From Date] to [To Date]
- Mode of Travel: [Flight/Train/Bus/Car]
- Accommodation: [Hotel/Relative's home]

This visit can be verified through travel records.`,
        suggestedEvidence: ['Tickets', 'Hotel booking', 'Passport stamps', 'Photos with location']
    },
    {
        id: 'custom',
        name: 'Custom Claim',
        category: 'Other',
        titleTemplate: '',
        descriptionTemplate: '',
        suggestedEvidence: []
    }
];

export function getTemplateById(id) {
    return CLAIM_TEMPLATES.find(t => t.id === id);
}

export function getTemplatesByCategory(category) {
    return CLAIM_TEMPLATES.filter(t => t.category === category);
}

export default CLAIM_TEMPLATES;
