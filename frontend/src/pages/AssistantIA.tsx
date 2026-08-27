// frontend/src/pages/AssistantIA.tsx

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Send,
  Bot,
  User,
  Loader2,
  ArrowLeft,
  Trash2,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { iaService } from "@/api/ia";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function AssistantIA() {
  const navigate = useNavigate();
  const { parcelles } = useApp();
  const [selectedParcelle, setSelectedParcelle] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Bonjour ! Je suis votre assistant agricole Mipanga. 🧑‍🌾\n\nPosez-moi toutes vos questions sur vos cultures, la météo, ou les recommandations pour vos parcelles.\n\nExemples :\n• Dois-je arroser aujourd'hui ?\n• Pourquoi mes feuilles jaunissent ?\n• Quand dois-je récolter ?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll vers le dernier message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus sur l'input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Envoyer un message
  const handleSend = async () => {
    if (!input.trim() || !selectedParcelle) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Préparer l'historique pour l'API
      const historique = messages
        .filter((m) => m.role !== "assistant" || m.id !== "1")
        .slice(-6)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const response = await iaService.chat({
        parcelle_id: selectedParcelle,
        question: userMessage.content,
        historique,
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.data.reponse || "Je n'ai pas pu répondre à votre question.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("❌ Erreur chat:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Désolé, je rencontre un problème technique. Veuillez réessayer.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Effacer la conversation
  const handleClear = () => {
    setMessages([
      {
        id: "1",
        role: "assistant",
        content: "🧑‍🌾 Nouvelle conversation ! Posez-moi vos questions sur vos cultures.",
        timestamp: new Date(),
      },
    ]);
  };

  // Raccourci clavier (Entrée pour envoyer, Shift+Entrée pour sauter une ligne)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Formatage de la réponse (supports basique)
  const formatMessage = (content: string) => {
    return content.split("\n").map((line, i) => {
      if (line.startsWith("•") || line.startsWith("-")) {
        return (
          <li key={i} className="ml-4 text-sm text-foreground">
            {line.replace(/^[•-]\s*/, "")}
          </li>
        );
      }
      if (line.startsWith("🔴") || line.startsWith("🟢") || line.startsWith("🟡")) {
        return (
          <p key={i} className="text-sm font-medium text-foreground">
            {line}
          </p>
        );
      }
      if (line.trim() === "") {
        return <br key={i} />;
      }
      return (
        <p key={i} className="text-sm text-foreground">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">🧑‍🌾 Assistant IA</h1>
              <p className="text-xs text-muted-foreground">
                Posez vos questions sur vos cultures
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={handleClear}
          className="rounded-xl border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Sélection parcelle */}
      <div className="mb-3">
        <select
          value={selectedParcelle || ""}
          onChange={(e) => setSelectedParcelle(Number(e.target.value))}
          className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Sélectionner une parcelle</option>
          {parcelles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nom} - {p.culture_details?.nom || "Culture inconnue"}
            </option>
          ))}
        </select>
        {!selectedParcelle && (
          <p className="mt-1 text-xs text-muted-foreground">
            ⚠️ Veuillez sélectionner une parcelle pour commencer
          </p>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/30 text-foreground"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {message.role === "assistant" ? (
                    <Bot className="h-4 w-4 text-primary" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                  <span className="text-xs font-medium opacity-70">
                    {message.role === "assistant" ? "Assistant IA" : "Vous"}
                  </span>
                  <span className="text-[10px] opacity-50">
                    {message.timestamp.toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="space-y-1">
                  {formatMessage(message.content)}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-2xl bg-muted/30 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">
                    L'assistant réfléchit...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="mt-3 flex gap-2">
        <div className="relative flex-1">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              selectedParcelle
                ? "Posez votre question..."
                : "Sélectionnez d'abord une parcelle"
            }
            disabled={!selectedParcelle || loading}
            className="h-12 w-full resize-none rounded-xl border border-input bg-background px-4 py-3 pr-12 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || !selectedParcelle || loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-primary transition-colors hover:bg-primary/10 disabled:opacity-50"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Suggestions */}
      <div className="mt-2 flex flex-wrap gap-2">
        {["Dois-je arroser aujourd'hui ?", "Pourquoi mes feuilles jaunissent ?", "Quand dois-je récolter ?"].map(
          (suggestion) => (
            <button
              key={suggestion}
              onClick={() => setInput(suggestion)}
              disabled={!selectedParcelle || loading}
              className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
            >
              {suggestion}
            </button>
          )
        )}
      </div>
    </div>
  );
}