import type { Node } from '@/types';

// ==========================================
// MOCK NODE TREE
// ==========================================
// Hierarchy:
//   root  CareFlow Organization
//   ├─ dept-clinical (Clinical Services)
//   │  ├─ dept-primary-care (Primary Care)
//   │  │  ├─ loc-la (Los Angeles Medical Center)
//   │  │  ├─ loc-sf (San Francisco Care Hub)
//   │  │  └─ prog-mobile-la (Mobile Outreach LA)
//   │  └─ dept-specialty (Specialty Care)
//   │     ├─ loc-houston (Houston Medical Plaza)
//   │     └─ loc-manhattan (Manhattan Medical Center)
//   ├─ dept-community (Community Health)
//   │  ├─ prog-school-screening (School Screening Program)
//   │  └─ loc-brooklyn (Brooklyn Health Hub)
//   └─ dept-admin (Administration)
//      └─ loc-hq (Headquarters)
//
// `path` stores the chain of ancestor ids (root included). `level` is the depth
// counted from the root (root = 0, top-level dept = 1, etc.).

const TS = '2024-01-01T00:00:00Z';

export const ROOT_NODE_ID = 'node-root';

export const mockNodes: Node[] = [
  {
    id: ROOT_NODE_ID,
    type: 'root',
    parentId: null,
    name: 'CareFlow',
    organizationName: 'CareFlow Health Network',
    description: 'Root node for the entire organization.',
    status: 'active',
    path: [],
    level: 0,
    createdAt: TS,
    updatedAt: TS,
  },

  // Top-level departments
  {
    id: 'node-clinical',
    type: 'department',
    parentId: ROOT_NODE_ID,
    name: 'Clinical Services',
    description: 'All direct patient care departments.',
    code: 'CLIN',
    status: 'active',
    path: [ROOT_NODE_ID],
    level: 1,
    createdAt: TS,
    updatedAt: TS,
  },
  {
    id: 'node-community',
    type: 'department',
    parentId: ROOT_NODE_ID,
    name: 'Community Health',
    description: 'Outreach and community programs.',
    code: 'COMM',
    status: 'active',
    path: [ROOT_NODE_ID],
    level: 1,
    createdAt: TS,
    updatedAt: TS,
  },
  {
    id: 'node-admin',
    type: 'department',
    parentId: ROOT_NODE_ID,
    name: 'Administration',
    description: 'Operational and administrative functions.',
    code: 'ADMIN',
    status: 'active',
    path: [ROOT_NODE_ID],
    level: 1,
    createdAt: TS,
    updatedAt: TS,
  },

  // Sub-departments under Clinical Services
  {
    id: 'node-primary-care',
    type: 'department',
    parentId: 'node-clinical',
    name: 'Primary Care',
    description: 'General medicine, family practice and routine visits.',
    code: 'CLIN-PC',
    status: 'active',
    path: [ROOT_NODE_ID, 'node-clinical'],
    level: 2,
    createdAt: TS,
    updatedAt: TS,
  },
  {
    id: 'node-specialty',
    type: 'department',
    parentId: 'node-clinical',
    name: 'Specialty Care',
    description: 'Cardiology, neurology and specialised disciplines.',
    code: 'CLIN-SP',
    status: 'active',
    path: [ROOT_NODE_ID, 'node-clinical'],
    level: 2,
    createdAt: TS,
    updatedAt: TS,
  },

  // Locations under Primary Care
  {
    id: 'node-loc-la',
    type: 'location',
    parentId: 'node-primary-care',
    name: 'Los Angeles Medical Center',
    address: '123 Healthcare Blvd, Suite 100',
    city: 'Los Angeles',
    contactNumber: '+1 (310) 555-0101',
    email: 'la.center@careflow.com',
    status: 'active',
    path: [ROOT_NODE_ID, 'node-clinical', 'node-primary-care'],
    level: 3,
    createdAt: TS,
    updatedAt: TS,
  },
  {
    id: 'node-loc-sf',
    type: 'location',
    parentId: 'node-primary-care',
    name: 'San Francisco Care Hub',
    address: '456 Wellness Ave',
    city: 'San Francisco',
    contactNumber: '+1 (415) 555-0202',
    email: 'sf.hub@careflow.com',
    status: 'active',
    path: [ROOT_NODE_ID, 'node-clinical', 'node-primary-care'],
    level: 3,
    createdAt: TS,
    updatedAt: TS,
  },
  {
    id: 'node-prog-mobile-la',
    type: 'program',
    parentId: 'node-primary-care',
    name: 'Mobile Outreach LA',
    description: 'Mobile clinic visiting underserved LA neighbourhoods.',
    schedule: 'Mon, Wed, Fri',
    area: 'Greater Los Angeles',
    contactNumber: '+1 (310) 555-9111',
    status: 'active',
    path: [ROOT_NODE_ID, 'node-clinical', 'node-primary-care'],
    level: 3,
    createdAt: TS,
    updatedAt: TS,
  },

  // Locations under Specialty Care
  {
    id: 'node-loc-houston',
    type: 'location',
    parentId: 'node-specialty',
    name: 'Houston Medical Plaza',
    address: '500 Texas Medical Center',
    city: 'Houston',
    contactNumber: '+1 (713) 555-0505',
    email: 'houston@careflow.com',
    status: 'active',
    path: [ROOT_NODE_ID, 'node-clinical', 'node-specialty'],
    level: 3,
    createdAt: TS,
    updatedAt: TS,
  },
  {
    id: 'node-loc-manhattan',
    type: 'location',
    parentId: 'node-specialty',
    name: 'Manhattan Medical Center',
    address: '1 Central Park Medical',
    city: 'New York',
    contactNumber: '+1 (212) 555-0808',
    email: 'manhattan@careflow.com',
    status: 'active',
    path: [ROOT_NODE_ID, 'node-clinical', 'node-specialty'],
    level: 3,
    createdAt: TS,
    updatedAt: TS,
  },

  // Programs / locations under Community Health
  {
    id: 'node-prog-school',
    type: 'program',
    parentId: 'node-community',
    name: 'School Screening Program',
    description: 'On-site health screenings at K-12 schools.',
    schedule: 'Tue, Thu',
    area: 'Bay Area schools',
    contactNumber: '+1 (415) 555-7700',
    status: 'active',
    path: [ROOT_NODE_ID, 'node-community'],
    level: 2,
    createdAt: TS,
    updatedAt: TS,
  },
  {
    id: 'node-loc-brooklyn',
    type: 'location',
    parentId: 'node-community',
    name: 'Brooklyn Health Hub',
    address: '300 Atlantic Care Ave',
    city: 'Brooklyn',
    contactNumber: '+1 (718) 555-0909',
    email: 'brooklyn@careflow.com',
    status: 'active',
    path: [ROOT_NODE_ID, 'node-community'],
    level: 2,
    createdAt: TS,
    updatedAt: TS,
  },

  // Locations under Administration
  {
    id: 'node-loc-hq',
    type: 'location',
    parentId: 'node-admin',
    name: 'Headquarters',
    address: '1 CareFlow Plaza',
    city: 'San Francisco',
    contactNumber: '+1 (415) 555-1000',
    email: 'hq@careflow.com',
    status: 'active',
    path: [ROOT_NODE_ID, 'node-admin'],
    level: 2,
    createdAt: TS,
    updatedAt: TS,
  },
];
