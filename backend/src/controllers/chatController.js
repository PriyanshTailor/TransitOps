import { HfInference } from '@huggingface/inference';
import pool from '../db/pool.js';

export const handleChat = async (req, res) => {
  try {
    const { message } = req.body;
    const { companyId, role } = req.user;

    const hfToken = process.env.HF_TOKEN;
    if (!hfToken || hfToken === 'hf_your_huggingface_token_here') {
      return res.status(400).json({ error: 'HuggingFace API token is missing or invalid in backend .env' });
    }

    const hf = new HfInference(hfToken);
    let systemPrompt = "You are an AI assistant for TransitOps.";
    
    if (role === 'Financial Analyst') {
      // Fetch financial data context
      const expensesRes = await pool.query('SELECT category, vendor, amount, approval_status, expense_date FROM expenses WHERE company_id = $1 ORDER BY expense_date DESC LIMIT 50', [companyId]);
      const fuelRes = await pool.query('SELECT fuel_type, liters, total_cost, fuel_date FROM fuel_records WHERE company_id = $1 ORDER BY fuel_date DESC LIMIT 50', [companyId]);
      
      const expenses = expensesRes.rows;
      const fuels = fuelRes.rows;
      
      systemPrompt = `You are a highly analytical AI Financial Assistant for TransitOps. 
You have access to the following recent expense data:
${JSON.stringify(expenses)}

And the following recent fuel logs:
${JSON.stringify(fuels)}

Analyze the user's request carefully based ONLY on this provided data. Give detailed insights, calculate totals if asked, and point out potential cost-saving opportunities or anomalies. Provide the response in clear Markdown.`;
    } else if (role === 'Super Admin') {
      // Fetch operational overview context
      const countsRes = await pool.query(`
        SELECT 
          (SELECT COUNT(*) FROM vehicles WHERE company_id = $1) as total_vehicles,
          (SELECT COUNT(*) FROM drivers WHERE company_id = $1) as total_drivers,
          (SELECT COUNT(*) FROM trips WHERE company_id = $1) as total_trips
      `, [companyId]);
      const statusesRes = await pool.query('SELECT status, COUNT(*) FROM vehicles WHERE company_id = $1 GROUP BY status', [companyId]);
      const financialRes = await pool.query(`
        SELECT SUM(revenue) as total_revenue, SUM(actual_cost) as total_trip_costs 
        FROM trips WHERE company_id = $1 AND status = 'Completed'
      `, [companyId]);
      const recentTripsRes = await pool.query('SELECT origin, destination, revenue, status FROM trips WHERE company_id = $1 ORDER BY created_at DESC LIMIT 10', [companyId]);
      
      systemPrompt = `You are the TransitOps Super Admin AI Assistant.
Here is the high-level platform status:
Totals: ${JSON.stringify(countsRes.rows[0])}
Vehicle Status Breakdown: ${JSON.stringify(statusesRes.rows)}
Financial Overview: ${JSON.stringify(financialRes.rows[0])}
Recent Trips: ${JSON.stringify(recentTripsRes.rows)}

Answer the admin's questions regarding fleet operations, scaling, and general performance insights using this data.`;
    } else {
      systemPrompt = "You are a helpful assistant for TransitOps. Answer any general questions about the platform.";
    }

    // Call Qwen via HuggingFace (Mistral removed from free tier)
    const response = await hf.chatCompletion({
      model: "Qwen/Qwen2.5-7B-Instruct",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 500,
    });

    const aiMessage = response.choices[0].message.content;
    res.json({ reply: aiMessage });

  } catch (err) {
    console.error("Chat Error:", err);
    res.status(500).json({ error: 'Failed to process AI chat request.' });
  }
};

export const parseOcr = async (req, res) => {
  try {
    const { text, type } = req.body; // type can be 'dl' or 'rc'
    
    const hfToken = process.env.HF_TOKEN;
    if (!hfToken || hfToken === 'hf_your_huggingface_token_here') {
      return res.status(400).json({ error: 'HuggingFace API token missing' });
    }

    const hf = new HfInference(hfToken);
    
    let systemPrompt = "Extract the Name, License Number, Expiry Date (YYYY-MM-DD), Blood Group, and Vehicle Category (e.g. Heavy, Light) from this messy OCR text. Return exactly a JSON object like {\"name\": \"John Doe\", \"license_number\": \"DL-12345\", \"license_expiry\": \"2030-01-01\", \"blood_group\": \"O+\", \"category\": \"Heavy\"}. No markdown formatting, just the raw JSON string.";
    if (type === 'rc') {
      systemPrompt = "Extract the Vehicle Name/Model, Registration Number, and VIN/Chassis Number from this messy OCR text. Return exactly a JSON object like {\"name\": \"Toyota Camry\", \"reg_number\": \"ABC-123\", \"vin_number\": \"1HGCM82633A\"}. No markdown formatting, just the raw JSON string.";
    }

    const response = await hf.chatCompletion({
      model: "Qwen/Qwen2.5-7B-Instruct",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `OCR Text:\n${text}` }
      ],
      max_tokens: 150,
      temperature: 0.1,
    });

    const aiMessage = response.choices[0].message.content.trim();
    
    // Attempt to parse JSON out of the response
    let parsed = {};
    try {
      // Find JSON block if it put markdown anyway
      const jsonMatch = aiMessage.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        parsed = JSON.parse(aiMessage);
      }
    } catch (e) {
      console.error("Failed to parse JSON from AI response:", aiMessage);
      throw new Error("AI returned invalid JSON");
    }

    res.json(parsed);
  } catch (err) {
    console.error("OCR Parse Error:", err);
    res.status(500).json({ error: 'Failed to process OCR text via AI.' });
  }
};
