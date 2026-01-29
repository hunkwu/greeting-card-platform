import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sampleTemplates = [
    // Birthday Templates
    {
        name: 'Happy Birthday Celebration',
        category: 'birthday',
        tags: ['party', 'celebration', 'colorful'],
        previewImageUrl: '/templates/birthday-01.jpg',
        isPremium: false,
        language: 'en',
        country: null,
        isUniversal: true,
        designData: { version: '1.0', objects: [] },
    },
    {
        name: '生日快乐祝福',
        category: 'birthday',
        tags: ['生日', '祝福', '快乐'],
        previewImageUrl: '/templates/birthday-02.jpg',
        isPremium: false,
        language: 'zh',
        country: 'CN',
        isUniversal: false,
        designData: { version: '1.0', objects: [] },
    },
    {
        name: 'Premium Birthday Gold',
        category: 'birthday',
        tags: ['luxury', 'gold', 'elegant'],
        previewImageUrl: '/templates/birthday-premium.jpg',
        isPremium: true,
        language: 'en',
        country: null,
        isUniversal: true,
        designData: { version: '1.0', objects: [] },
    },

    // Holiday Templates
    {
        name: 'Christmas Joy',
        category: 'holiday',
        tags: ['christmas', 'winter', 'snow'],
        previewImageUrl: '/templates/christmas-01.jpg',
        isPremium: false,
        language: 'en',
        country: null,
        isUniversal: true,
        designData: { version: '1.0', objects: [] },
    },
    {
        name: '春节祝福',
        category: 'holiday',
        tags: ['春节', '新年', '红色'],
        previewImageUrl: '/templates/spring-festival.jpg',
        isPremium: false,
        language: 'zh',
        country: 'CN',
        isUniversal: false,
        designData: { version: '1.0', objects: [] },
    },
    {
        name: 'Thanksgiving Gratitude',
        category: 'holiday',
        tags: ['thanksgiving', 'autumn', 'gratitude'],
        previewImageUrl: '/templates/thanksgiving.jpg',
        isPremium: false,
        language: 'en',
        country: 'US',
        isUniversal: false,
        designData: { version: '1.0', objects: [] },
    },

    // Wedding Templates
    {
        name: 'Elegant Wedding Invitation',
        category: 'wedding',
        tags: ['elegant', 'romantic', 'floral'],
        previewImageUrl: '/templates/wedding-01.jpg',
        isPremium: true,
        language: 'en',
        country: null,
        isUniversal: true,
        designData: { version: '1.0', objects: [] },
    },
    {
        name: '浪漫婚礼邀请',
        category: 'wedding',
        tags: ['浪漫', '优雅', '花卉'],
        previewImageUrl: '/templates/wedding-02.jpg',
        isPremium: true,
        language: 'zh',
        country: null,
        isUniversal: false,
        designData: { version: '1.0', objects: [] },
    },

    // Thank You Templates
    {
        name: 'Simple Thank You',
        category: 'thank-you',
        tags: ['gratitude', 'simple', 'clean'],
        previewImageUrl: '/templates/thankyou-01.jpg',
        isPremium: false,
        language: 'en',
        country: null,
        isUniversal: true,
        designData: { version: '1.0', objects: [] },
    },
    {
        name: 'Professional Thank You',
        category: 'thank-you',
        tags: ['professional', 'business', 'formal'],
        previewImageUrl: '/templates/thankyou-02.jpg',
        isPremium: false,
        language: 'en',
        country: null,
        isUniversal: true,
        designData: { version: '1.0', objects: [] },
    },

    // Love & Romance Templates
    {
        name: 'Romantic Love Card',
        category: 'love',
        tags: ['romantic', 'hearts', 'valentine'],
        previewImageUrl: '/templates/love-01.jpg',
        isPremium: false,
        language: 'en',
        country: null,
        isUniversal: true,
        designData: { version: '1.0', objects: [] },
    },
    {
        name: 'Anniversary Celebration',
        category: 'love',
        tags: ['anniversary', 'celebration', 'romantic'],
        previewImageUrl: '/templates/anniversary.jpg',
        isPremium: true,
        language: 'en',
        country: null,
        isUniversal: true,
        designData: { version: '1.0', objects: [] },
    },

    // Business Templates
    {
        name: 'Corporate Event Invitation',
        category: 'business',
        tags: ['corporate', 'professional', 'formal'],
        previewImageUrl: '/templates/business-01.jpg',
        isPremium: true,
        language: 'en',
        country: null,
        isUniversal: true,
        designData: { version: '1.0', objects: [] },
    },
    {
        name: 'Business Congratulations',
        category: 'business',
        tags: ['congratulations', 'achievement', 'professional'],
        previewImageUrl: '/templates/business-02.jpg',
        isPremium: false,
        language: 'en',
        country: null,
        isUniversal: true,
        designData: { version: '1.0', objects: [] },
    },

    // Get Well Soon Templates
    {
        name: 'Get Well Soon Flowers',
        category: 'get-well',
        tags: ['flowers', 'healing', 'caring'],
        previewImageUrl: '/templates/getwell-01.jpg',
        isPremium: false,
        language: 'en',
        country: null,
        isUniversal: true,
        designData: { version: '1.0', objects: [] },
    },
    {
        name: '早日康复',
        category: 'get-well',
        tags: ['康复', '祝福', '关怀'],
        previewImageUrl: '/templates/getwell-02.jpg',
        isPremium: false,
        language: 'zh',
        country: null,
        isUniversal: false,
        designData: { version: '1.0', objects: [] },
    },
];

async function main() {
    console.log('🌱 Starting database seed...');

    // Clear existing templates
    await prisma.template.deleteMany({});
    console.log('✅ Cleared existing templates');

    // Create sample templates
    for (const template of sampleTemplates) {
        await prisma.template.create({
            data: {
                ...template,
                downloadsCount: Math.floor(Math.random() * 1000) + 50,
            },
        });
    }

    console.log(`✅ Created ${sampleTemplates.length} sample templates`);
    console.log('🎉 Seeding completed!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
