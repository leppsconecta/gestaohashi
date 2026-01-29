
const url = 'https://txlvjukmjjfjufwkkrzm.supabase.co/rest/v1/equipe?select=*';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4bHZqdWttampmanVmd2trcnptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5MzA0MDUsImV4cCI6MjA1NjUwNjQwNX0.UQFz5ZoGivjGzy2-XADgRKqqH3Cm2bM5jSqPFHzjzaQ';

async function test() {
    try {
        const response = await fetch(url, {
            headers: {
                'apikey': key,
                'Authorization': `Bearer ${key}`,
                'Content-Profile': 'gestaohashi' // Critical
            }
        });

        console.log('Status:', response.status);
        const text = await response.text();
        console.log('Body:', text);
    } catch (e) {
        console.error(e);
    }
}

test();
