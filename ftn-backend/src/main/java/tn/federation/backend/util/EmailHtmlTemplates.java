package tn.federation.backend.util;

public final class EmailHtmlTemplates {
    private EmailHtmlTemplates() {
    }

    public static String layout(String title, String bodyHtml) {
        return "<!DOCTYPE html><html lang=\"fr\"><head><meta charset=\"UTF-8\"/><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"/>"
                + "<title>" + escape(title) + "</title></head>"
                + "<body style=\"margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Roboto,Arial,sans-serif;\">"
                + "<table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"background:#f1f5f9;padding:32px 16px;\">"
                + "<tr><td align=\"center\">"
                + "<table role=\"presentation\" width=\"100%\" style=\"max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 40px rgba(15,23,42,0.08);\">"
                + "<tr><td style=\"background:linear-gradient(135deg,#0d47a1 0%,#1565C0 55%,#1976D2 100%);padding:28px 32px;\">"
                + "<p style=\"margin:0 0 6px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:rgba(255,255,255,0.75);\">Fédération Tunisienne de Natation</p>"
                + "<h1 style=\"margin:0;font-size:22px;font-weight:700;color:#ffffff;\">" + escape(title) + "</h1>"
                + "</td></tr>"
                + "<tr><td style=\"padding:32px;color:#334155;font-size:15px;line-height:1.6;\">" + bodyHtml + "</td></tr>"
                + "<tr><td style=\"padding:20px 32px 28px;border-top:1px solid #e2e8f0;color:#94a3b8;font-size:12px;text-align:center;\">"
                + "© FTN — Message automatique, merci de ne pas répondre directement à cet email."
                + "</td></tr></table></td></tr></table></body></html>";
    }

    public static String primaryButton(String label, String href) {
        return "<div style=\"text-align:center;margin:28px 0 8px;\">"
                + "<a href=\"" + escapeAttr(href) + "\" style=\"display:inline-block;background:#1565C0;color:#ffffff;text-decoration:none;"
                + "padding:14px 28px;border-radius:10px;font-weight:700;font-size:15px;\">" + escape(label) + "</a></div>";
    }

    public static String infoBox(String label, String value) {
        return "<div style=\"background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px 16px;margin:12px 0;\">"
                + "<div style=\"font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#64748b;margin-bottom:4px;\">"
                + escape(label) + "</div>"
                + "<div style=\"font-size:15px;font-weight:600;color:#0f172a;word-break:break-all;\">" + escape(value) + "</div>"
                + "</div>";
    }

    public static String warningBox(String text) {
        return "<div style=\"background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:14px 16px;margin:16px 0;color:#92400e;font-size:14px;\">"
                + escape(text) + "</div>";
    }

    private static String escape(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;");
    }

    private static String escapeAttr(String value) {
        return escape(value).replace("'", "&#39;");
    }
}
