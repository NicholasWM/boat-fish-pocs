import { db } from '@/lib/db/client'
import { tenants, users, boats, customers } from '@/lib/db/schema'
import { generatePasswordHash } from '@/lib/auth/hash'
import { v4 as uuidv4 } from 'uuid'

const now = new Date().toISOString()

async function seed() {
  console.log('Seeding database...')

  // Tenant 1: Demo Marina
  const tenant1Id = uuidv4()
  await db.insert(tenants).values({
    id: tenant1Id,
    slug: 'demo',
    name: 'Demo Marina',
    features: JSON.stringify({
      bookings: true,
      fleet: true,
      crew: true,
      payments: true,
      customers: true,
    }),
    branding: JSON.stringify({
      companyName: 'Demo Marina',
      primaryColor: '#0e7490',
      secondaryColor: '#7c3aed',
      accentColor: '#06b6d4',
    }),
    createdAt: now,
    updatedAt: now,
  })
  console.log('Created tenant 1: Demo Marina')

  const user1Id = uuidv4()
  const passwordHash1 = await generatePasswordHash('demo123')
  await db.insert(users).values({
    id: user1Id,
    email: 'admin@demo.com',
    passwordHash: passwordHash1,
    name: 'Admin User',
    tenantId: tenant1Id,
    role: 'owner',
    createdAt: now,
  })

  const boat1Id = uuidv4()
  const boat2Id = uuidv4()
  const boat3Id = uuidv4()
  await db.insert(boats).values([
    {
      id: boat1Id, tenantId: tenant1Id,
      name: 'Pesqueiro Azul', type: 'pesca', capacity: 8,
      description: 'Barco de pesca com equipamento completo',
      photoUrls: '[]', status: 'active',
      pricing: JSON.stringify({ basePrice: 500, perHour: 150, minHours: 4 }),
      features: JSON.stringify(['GPS', 'Sonar', 'Cooler', 'Caiaque']),
      createdAt: now, updatedAt: now,
    },
    {
      id: boat2Id, tenantId: tenant1Id,
      name: 'Explorer II', type: 'passeio', capacity: 12,
      description: 'Barco de passeio com deck aberto',
      photoUrls: '[]', status: 'active',
      pricing: JSON.stringify({ basePrice: 800, perHour: 200, minHours: 3 }),
      features: JSON.stringify(['WiFi', 'Som', 'Banheiro', 'Cobertura']),
      createdAt: now, updatedAt: now,
    },
    {
      id: boat3Id, tenantId: tenant1Id,
      name: 'Sunset Charter', type: 'luxury', capacity: 6,
      description: 'Lancha de luxo para eventos',
      photoUrls: '[]', status: 'maintenance',
      pricing: JSON.stringify({ basePrice: 1200, perHour: 350, minHours: 2 }),
      features: JSON.stringify(['Bar', 'Iluminacao', 'Cama', 'Ar Condicionado']),
      createdAt: now, updatedAt: now,
    },
  ])

  await db.insert(customers).values([
    { id: uuidv4(), tenantId: tenant1Id, name: 'Joao Silva', email: 'joao@email.com', phone: '+55 11 99999-0001', createdAt: now },
    { id: uuidv4(), tenantId: tenant1Id, name: 'Maria Santos', email: 'maria@email.com', phone: '+55 11 99999-0002', createdAt: now },
    { id: uuidv4(), tenantId: tenant1Id, name: 'Pedro Oliveira', email: 'pedro@email.com', phone: '+55 11 99999-0003', createdAt: now },
  ])

  // Tenant 2: Pescando Vida
  const tenant2Id = uuidv4()
  await db.insert(tenants).values({
    id: tenant2Id,
    slug: 'pescandovida',
    name: 'Pescando Vida',
    features: JSON.stringify({
      bookings: true,
      fleet: true,
      crew: true,
      payments: true,
      customers: true,
    }),
    branding: JSON.stringify({
      companyName: 'Pescando Vida',
      primaryColor: '#16a34a',
      secondaryColor: '#ea580c',
      accentColor: '#0ea5e9',
    }),
    createdAt: now,
    updatedAt: now,
  })
  console.log('Created tenant 2: Pescando Vida')

  const user2Id = uuidv4()
  const passwordHash2 = await generatePasswordHash('pescando123')
  await db.insert(users).values({
    id: user2Id,
    email: 'admin@pescandovida.com',
    passwordHash: passwordHash2,
    name: 'Admin Pescando Vida',
    tenantId: tenant2Id,
    role: 'owner',
    createdAt: now,
  })

  const boat4Id = uuidv4()
  const boat5Id = uuidv4()
  await db.insert(boats).values([
    {
      id: boat4Id, tenantId: tenant2Id,
      name: 'Pesqueiro do João', type: 'pesca', capacity: 6,
      description: 'Barco ideal para pescaria em alto mar',
      photoUrls: '[]', status: 'active',
      pricing: JSON.stringify({ basePrice: 400, perHour: 120, minHours: 3 }),
      features: JSON.stringify(['GPS', 'Sonar', 'Cooler']),
      createdAt: now, updatedAt: now,
    },
    {
      id: boat5Id, tenantId: tenant2Id,
      name: 'Aventureiro', type: 'passeio', capacity: 10,
      description: 'Passeio ecológico pela costa',
      photoUrls: '[]', status: 'active',
      pricing: JSON.stringify({ basePrice: 600, perHour: 180, minHours: 4 }),
      features: JSON.stringify(['WiFi', 'Banheiro', 'Cobertura', 'Caiaque']),
      createdAt: now, updatedAt: now,
    },
  ])

  await db.insert(customers).values([
    { id: uuidv4(), tenantId: tenant2Id, name: 'Carlos Mendes', email: 'carlos@email.com', phone: '+55 21 98888-0001', createdAt: now },
    { id: uuidv4(), tenantId: tenant2Id, name: 'Ana Costa', email: 'ana@email.com', phone: '+55 21 98888-0002', createdAt: now },
  ])

  console.log('Seed completed successfully!')
  console.log('\n=== Tenant 1: Demo Marina ===')
  console.log('  Email: admin@demo.com')
  console.log('  Password: demo123')
  console.log('  URL: /tenant/demo/dashboard')
  console.log('\n=== Tenant 2: Pescando Vida ===')
  console.log('  Email: admin@pescandovida.com')
  console.log('  Password: pescando123')
  console.log('  URL: /tenant/pescandovida/dashboard')
}

seed().catch(console.error).finally(() => process.exit(0))
