import { Router } from "express";
import {
  getHistoricoNotificacoes,
  reenviarNotificacoes,
  enviarNotificacaoManual,
  testarEmail,
  testarWhatsApp,
  testarConfiguracoes,
} from "../controllers/notificationController.js";

const router = Router();

// Rotas para notificações de usuários
router.get("/user/:userId/history", getHistoricoNotificacoes);
router.post("/user/:userId/resend", reenviarNotificacoes);
router.post("/user/:userId/send", enviarNotificacaoManual);

// Rotas para teste de configuração
router.get("/test/email", testarEmail);
router.get("/test/whatsapp", testarWhatsApp);
router.get("/test/all", testarConfiguracoes);

export default router;
