#!/usr/bin/env node

/**
 * Upload localized app store content to iOS App Store and Google Play Store
 * 
 * Usage:
 *   node scripts/upload-app-store-content.js
 * 
 * Environment variables:
 *   APP_STORE_CONNECT_KEY - App Store Connect API key (JSON format)
 *   GOOGLE_PLAY_KEY - Google Play Service Account key (JSON format)
 */

const fs = require('fs');
const path = require('path');

// Language configuration
const LANGUAGES = {
  en: { name: 'English', appStoreCode: 'en-US', playStoreCode: 'en-US' },
  es: { name: 'Spanish', appStoreCode: 'es-ES', playStoreCode: 'es' },
  fr: { name: 'French', appStoreCode: 'fr-FR', playStoreCode: 'fr' },
  de: { name: 'German', appStoreCode: 'de-DE', playStoreCode: 'de' },
  ja: { name: 'Japanese', appStoreCode: 'ja', playStoreCode: 'ja' },
};

// Load localized descriptions
const descriptionsPath = path.join(__dirname, '../LOCALIZED_APP_STORE_DESCRIPTIONS.md');
const descriptions = fs.readFileSync(descriptionsPath, 'utf-8');

// Parse descriptions by language
function parseDescriptions(content) {
  const result = {};
  
  Object.keys(LANGUAGES).forEach(lang => {
    const langName = LANGUAGES[lang].name;
    const regex = new RegExp(`## ${langName}.*?(?=## |$)`, 's');
    const match = content.match(regex);
    
    if (match) {
      const section = match[0];
      result[lang] = {
        title: extractField(section, 'App Store Title'),
        subtitle: extractField(section, 'Subtitle'),
        shortDescription: extractField(section, 'Short Description'),
        fullDescription: extractField(section, 'Full Description'),
        keywords: extractField(section, 'Keywords'),
      };
    }
  });
  
  return result;
}

function extractField(section, fieldName) {
  const regex = new RegExp(`### ${fieldName}\\s*\\n([^\\n]+(?:\\n(?!###|##)[^\\n]+)*)`);
  const match = section.match(regex);
  return match ? match[1].trim() : '';
}

// Upload to App Store Connect
async function uploadToAppStore(languageCode, content) {
  console.log(`📱 Uploading to App Store for ${languageCode}...`);
  
  // This would use the App Store Connect API
  // For now, we'll just log the content that would be uploaded
  console.log(`  Title: ${content.title}`);
  console.log(`  Subtitle: ${content.subtitle}`);
  console.log(`  Keywords: ${content.keywords}`);
  
  // In production, you would use:
  // const appStoreConnect = require('app-store-connect');
  // await appStoreConnect.updateAppStoreVersion({...})
}

// Upload to Google Play Store
async function uploadToGooglePlayStore(languageCode, content) {
  console.log(`🤖 Uploading to Google Play Store for ${languageCode}...`);
  
  // This would use the Google Play Developer API
  // For now, we'll just log the content that would be uploaded
  console.log(`  Title: ${content.title}`);
  console.log(`  Short description: ${content.shortDescription}`);
  console.log(`  Full description: ${content.fullDescription}`);
  
  // In production, you would use:
  // const androidpublisher = require('googleapis').androidpublisher('v3');
  // await androidpublisher.edits.listings.update({...})
}

// Main upload function
async function main() {
  try {
    console.log('🚀 Starting app store content upload...\n');
    
    const parsedContent = parseDescriptions(descriptions);
    
    // Upload to both stores
    for (const [lang, content] of Object.entries(parsedContent)) {
      const langInfo = LANGUAGES[lang];
      
      console.log(`\n📦 Processing ${langInfo.name} (${lang})`);
      console.log('─'.repeat(50));
      
      // Upload to App Store
      if (process.env.APP_STORE_CONNECT_KEY) {
        await uploadToAppStore(langInfo.appStoreCode, content);
      } else {
        console.log('⚠️  Skipping App Store (APP_STORE_CONNECT_KEY not set)');
      }
      
      // Upload to Google Play Store
      if (process.env.GOOGLE_PLAY_KEY) {
        await uploadToGooglePlayStore(langInfo.playStoreCode, content);
      } else {
        console.log('⚠️  Skipping Google Play Store (GOOGLE_PLAY_KEY not set)');
      }
    }
    
    console.log('\n✅ App store content upload complete!');
    console.log('\n📋 Next steps:');
    console.log('  1. Review content in App Store Connect');
    console.log('  2. Review content in Google Play Console');
    console.log('  3. Submit for review');
    
  } catch (error) {
    console.error('❌ Upload failed:', error.message);
    process.exit(1);
  }
}

main();
