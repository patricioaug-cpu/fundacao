import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  
  // 1. Send Login Email Notification
  app.post("/api/notify-login", async (req, res) => {
    const { name, email, deviceSerial } = req.body;
    const adminEmail = process.env.ADMIN_EMAIL || "patricioaug@gmail.com";

    // Basic validation of credentials
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn("⚠️ Notificação de e-mail pulada: EMAIL_USER ou EMAIL_PASS não configurados nos Secrets.");
      return res.json({ success: true, message: "Credentials not configured" });
    }

    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail', // Default to Gmail, but could be expanded
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      const mailOptions = {
        from: `"FundAção Notificações" <${process.env.EMAIL_USER}>`,
        to: adminEmail,
        subject: `🧱 Novo Acesso: ${name}`,
        text: `
          Relatório de Acesso - FundAção
          --------------------------------
          Usuário: ${name}
          E-mail: ${email}
          Data: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
          ID Dispositivo: ${deviceSerial}
          --------------------------------
        `
      };

      await transporter.sendMail(mailOptions);
      console.log(`✅ E-mail de notificação enviado para ${adminEmail}`);
      res.json({ success: true });
    } catch (error: any) {
      // Handle specific SMTP errors
      if (error.code === 'EAUTH') {
        console.error("❌ ERRO DE AUTENTICAÇÃO DE E-MAIL (535):");
        console.error("   O Google rejeitou suas credenciais. Isso geralmente ocorre porque você está usando sua senha normal.");
        console.error("   SOLUÇÃO: Você deve usar uma 'Senha de App' de 16 dígitos.");
        console.error("   PASSO A PASSO: https://support.google.com/accounts/answer/185833");
      } else {
        console.error("❌ Erro ao enviar e-mail:", error.message);
      }
      
      // We return 200 even on error to not break the client-side login flow
      res.json({ success: false, error: "Auth failed" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
