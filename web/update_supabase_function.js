const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Supabase configuration
const supabaseUrl = 'https://ozdpslybhvrpdvgvayhr.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHBzbHliaHZycGR2Z3ZheWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MzI5MTQsImV4cCI6MjA3NTMwODkxNH0.7QSR9QRVNsCSWrTXhJodmXJI0GG8XOlyITNpFzesw8s'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function updateFunction() {
  try {
    // Read the SQL file
    const sqlContent = fs.readFileSync(path.join(__dirname, '..', 'create_function.sql'), 'utf8')

    console.log('Updating Supabase function...')
    console.log('SQL Content:')
    console.log(sqlContent)

    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlContent })

    if (error) {
      console.error('Error updating function:', error)
      console.log('\n=== MANUAL UPDATE REQUIRED ===')
      console.log('Please update the function manually in Supabase Dashboard:')
      console.log('1. Go to: https://supabase.com/dashboard/project/ozdpslybhvrpdvgvayhr/sql')
      console.log('2. Copy and paste the following SQL:')
      console.log('\n--- SQL START ---')
      console.log(sqlContent)
      console.log('--- SQL END ---\n')
      console.log('3. Click "Run" to execute')
      process.exit(1)
    }

    console.log('Function updated successfully!')
    console.log('Data:', data)
  } catch (err) {
    console.error('Unexpected error:', err)

    // Print manual update instructions
    const sqlContent = fs.readFileSync(path.join(__dirname, '..', 'create_function.sql'), 'utf8')
    console.log('\n=== MANUAL UPDATE REQUIRED ===')
    console.log('Please update the function manually in Supabase Dashboard:')
    console.log('1. Go to: https://supabase.com/dashboard/project/ozdpslybhvrpdvgvayhr/sql')
    console.log('2. Copy and paste the following SQL:')
    console.log('\n--- SQL START ---')
    console.log(sqlContent)
    console.log('--- SQL END ---\n')
    console.log('3. Click "Run" to execute')
    process.exit(1)
  }
}

updateFunction()
