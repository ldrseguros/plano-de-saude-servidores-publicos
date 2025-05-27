import { useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface AdesaoData {
  dadosTitular: {
    nome: string;
    cpf: string;
    email: string;
    telefone: string;
    endereco: string;
    cidade: string;
    cep: string;
    dataNascimento: string;
  };
  planoSelecionado: string;
  odontologico: boolean;
  dependentes: Array<{
    nome: string;
    cpf: string;
    parentesco: string;
    dataNascimento: string;
  }>;
  valorTotal: number;
  userId?: string;
}

export const usePdfGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async (data: AdesaoData) => {
    setIsGenerating(true);

    try {
      // Criar um novo documento PDF
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Cores do tema
      const primaryBlue = [0, 102, 204] as const;
      const lightBlue = [240, 248, 255] as const;
      const darkGray = [51, 51, 51] as const;
      const mediumGray = [102, 102, 102] as const;
      const lightGray = [245, 245, 245] as const;

      // Background header
      pdf.setFillColor(lightBlue[0], lightBlue[1], lightBlue[2]);
      pdf.rect(0, 0, pageWidth, 50, "F");

      // Header principal
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(24);
      pdf.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
      pdf.text("BRASIL SAÚDE SERVIDOR", pageWidth / 2, 20, { align: "center" });

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(14);
      pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      pdf.text("Comprovante de Adesão ao Plano de Saúde", pageWidth / 2, 30, {
        align: "center",
      });

      // Data e ID no canto superior direito
      pdf.setFontSize(9);
      pdf.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2]);
      const dataAtual = new Date().toLocaleDateString("pt-BR");
      const horaAtual = new Date().toLocaleTimeString("pt-BR");
      pdf.text(`Gerado em: ${dataAtual} às ${horaAtual}`, pageWidth - 15, 42, {
        align: "right",
      });

      if (data.userId) {
        pdf.text(`ID: ${data.userId}`, pageWidth - 15, 47, { align: "right" });
      }

      let yPosition = 65;

      // Seção: Dados do Titular
      // Background da seção
      pdf.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
      pdf.rect(15, yPosition - 5, pageWidth - 30, 65, "F");

      // Título da seção
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(16);
      pdf.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
      pdf.text("DADOS DO TITULAR", 20, yPosition + 5);

      yPosition += 15;

      // Dados em duas colunas
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(11);
      pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);

      // Coluna esquerda
      const leftColumn = [
        { label: "Nome:", value: data.dadosTitular.nome },
        { label: "CPF:", value: data.dadosTitular.cpf },
        { label: "Email:", value: data.dadosTitular.email },
        { label: "Telefone:", value: data.dadosTitular.telefone },
      ];

      // Coluna direita
      const rightColumn = [
        {
          label: "Data de Nascimento:",
          value: data.dadosTitular.dataNascimento,
        },
        { label: "Cidade:", value: data.dadosTitular.cidade },
        { label: "CEP:", value: data.dadosTitular.cep },
        { label: "Endereço:", value: data.dadosTitular.endereco },
      ];

      let tempY = yPosition;

      // Renderizar coluna esquerda
      leftColumn.forEach((item) => {
        pdf.setFont("helvetica", "bold");
        pdf.text(item.label, 20, tempY);
        pdf.setFont("helvetica", "normal");
        pdf.text(item.value, 45, tempY);
        tempY += 8;
      });

      tempY = yPosition;

      // Renderizar coluna direita
      rightColumn.forEach((item) => {
        pdf.setFont("helvetica", "bold");
        pdf.text(item.label, pageWidth / 2 + 10, tempY);
        pdf.setFont("helvetica", "normal");
        const maxWidth = pageWidth - (pageWidth / 2 + 45);
        const lines = pdf.splitTextToSize(item.value, maxWidth);
        pdf.text(lines, pageWidth / 2 + 45, tempY);
        tempY += 8;
      });

      yPosition += 50;

      // Seção: Plano Selecionado
      yPosition += 10;

      // Background da seção
      pdf.setFillColor(lightBlue[0], lightBlue[1], lightBlue[2]);
      pdf.rect(15, yPosition - 5, pageWidth - 30, 35, "F");

      // Título da seção
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(16);
      pdf.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
      pdf.text("PLANO SELECIONADO", 20, yPosition + 5);

      yPosition += 15;

      const planoNome =
        data.planoSelecionado === "apartamento"
          ? "Plano Apartamento"
          : "Plano Enfermaria";
      const planoValor =
        data.planoSelecionado === "apartamento" ? "R$ 211,00" : "R$ 169,00";

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(12);
      pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);

      // Plano principal
      pdf.setFont("helvetica", "bold");
      pdf.text("Plano:", 20, yPosition);
      pdf.setFont("helvetica", "normal");
      pdf.text(planoNome, 45, yPosition);

      pdf.setFont("helvetica", "bold");
      pdf.text("Valor:", pageWidth / 2 + 10, yPosition);
      pdf.setFont("helvetica", "normal");
      pdf.text(`${planoValor}/mês`, pageWidth / 2 + 35, yPosition);

      yPosition += 10;

      // Odontológico
      pdf.setFont("helvetica", "bold");
      pdf.text("Odontológico:", 20, yPosition);
      pdf.setFont("helvetica", "normal");
      const odontoText = data.odontologico
        ? "Sim (+R$ 25,00/mês)"
        : "Não incluído";
      pdf.text(odontoText, 60, yPosition);

      yPosition += 20;

      // Seção: Dependentes
      if (data.dependentes.length > 0) {
        yPosition += 10;

        // Background da seção
        const dependentesHeight = data.dependentes.length * 25 + 20;
        pdf.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
        pdf.rect(15, yPosition - 5, pageWidth - 30, dependentesHeight, "F");

        // Título da seção
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(16);
        pdf.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
        pdf.text(`DEPENDENTES (${data.dependentes.length})`, 20, yPosition + 5);

        yPosition += 15;

        data.dependentes.forEach((dep, index) => {
          // Número do dependente
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(12);
          pdf.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
          pdf.text(`${index + 1}.`, 20, yPosition);

          // Nome do dependente
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(11);
          pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
          pdf.text(dep.nome, 30, yPosition);

          yPosition += 8;

          // Informações do dependente
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(10);
          pdf.text(`CPF: ${dep.cpf}`, 30, yPosition);
          pdf.text(
            `Parentesco: ${dep.parentesco}`,
            pageWidth / 2 + 10,
            yPosition
          );

          yPosition += 6;
          pdf.text(`Data de Nascimento: ${dep.dataNascimento}`, 30, yPosition);

          yPosition += 11;
        });

        yPosition += 5;
      }

      // Seção: Resumo Financeiro
      yPosition += 15;

      // Título da seção
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(16);
      pdf.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
      pdf.text("RESUMO FINANCEIRO", 20, yPosition);

      yPosition += 15;

      const totalPessoas = 1 + data.dependentes.length;

      // Informações gerais
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(11);
      pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      pdf.text(`Total de pessoas cobertas: ${totalPessoas}`, 20, yPosition);

      yPosition += 15;

      // Box destacado com valor total
      pdf.setFillColor(0, 150, 0); // Verde
      pdf.rect(15, yPosition - 8, pageWidth - 30, 25, "F");

      // Borda do box
      pdf.setDrawColor(0, 120, 0);
      pdf.setLineWidth(1);
      pdf.rect(15, yPosition - 8, pageWidth - 30, 25);

      // Texto do valor total
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(18);
      pdf.setTextColor(255, 255, 255); // Branco
      pdf.text(
        `VALOR TOTAL MENSAL: R$ ${data.valorTotal
          .toFixed(2)
          .replace(".", ",")}`,
        pageWidth / 2,
        yPosition + 5,
        { align: "center" }
      );

      yPosition += 30;

      // Seção: Informações Adicionais
      yPosition += 10;

      // Background da seção
      pdf.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
      pdf.rect(15, yPosition - 5, pageWidth - 30, 25, "F");

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
      pdf.text("INFORMAÇÕES DA ADESÃO", 20, yPosition + 5);

      yPosition += 15;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);

      if (data.userId) {
        pdf.text(`ID da Adesão: ${data.userId}`, 20, yPosition);
        yPosition += 8;
      }

      pdf.text(
        `Data de Geração: ${new Date().toLocaleDateString(
          "pt-BR"
        )} às ${new Date().toLocaleTimeString("pt-BR")}`,
        20,
        yPosition
      );

      // Footer profissional
      const footerY = pageHeight - 30;

      // Linha separadora do footer
      pdf.setDrawColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
      pdf.setLineWidth(0.5);
      pdf.line(20, footerY - 5, pageWidth - 20, footerY - 5);

      // Texto do footer
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
      pdf.text("BRASIL SAÚDE SERVIDOR", pageWidth / 2, footerY, {
        align: "center",
      });

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2]);
      pdf.text(
        "Este documento comprova sua adesão ao Plano de Saúde para Servidores de Anicuns.",
        pageWidth / 2,
        footerY + 6,
        { align: "center" }
      );
      pdf.text(
        "Em caso de dúvidas, entre em contato com nossa equipe.",
        pageWidth / 2,
        footerY + 12,
        { align: "center" }
      );

      // Informações de contato
      pdf.setFontSize(8);
      pdf.text(
        "📞 (62) 3000-0000 | ✉️ contato@brasilsaudeservidor.com.br",
        pageWidth / 2,
        footerY + 18,
        { align: "center" }
      );

      // Gerar nome do arquivo
      const fileName = `adesao-brasil-saude-${data.dadosTitular.nome
        .replace(/\s+/g, "-")
        .toLowerCase()}-${new Date().toISOString().split("T")[0]}.pdf`;

      // Fazer download
      pdf.save(fileName);

      return { success: true, fileName };
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      return { success: false, error: "Erro ao gerar PDF" };
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePDFFromElement = async (
    elementId: string,
    fileName: string = "documento.pdf"
  ) => {
    setIsGenerating(true);

    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error("Elemento não encontrado");
      }

      // Capturar o elemento como imagem
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");

      // Criar PDF
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pageWidth - 20; // Margem de 10mm de cada lado
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 10; // Margem superior

      // Adicionar primeira página
      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - 20; // Subtrair margens

      // Adicionar páginas adicionais se necessário
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight - 20;
      }

      pdf.save(fileName);

      return { success: true, fileName };
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      return { success: false, error: "Erro ao gerar PDF" };
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generatePDF,
    generatePDFFromElement,
    isGenerating,
  };
};
