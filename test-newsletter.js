// Test script for newsletter functionality
async function testNewsletterAPI() {
  try {
    console.log('Testing newsletter count API...');
    const countResponse = await fetch('http://localhost:5000/api/newsletter/count');
    const countData = await countResponse.json();
    console.log('Newsletter count:', countData);

    console.log('Testing newsletter subscription...');
    const subscribeResponse = await fetch('http://localhost:5000/api/newsletter/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: 'test@example.com' }),
    });
    const subscribeData = await subscribeResponse.json();
    console.log('Subscription result:', subscribeData);

    console.log('Testing duplicate subscription...');
    const duplicateResponse = await fetch('http://localhost:5000/api/newsletter/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: 'test@example.com' }),
    });
    const duplicateData = await duplicateResponse.json();
    console.log('Duplicate subscription result:', duplicateData);

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testNewsletterAPI();