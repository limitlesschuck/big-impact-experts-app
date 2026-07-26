import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#FFFFFF",
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 48,
    fontFamily: "Helvetica",
  },
  header: {
    backgroundColor: "#2D1B69",
    marginHorizontal: -48,
    marginTop: -48,
    paddingHorizontal: 48,
    paddingVertical: 28,
    marginBottom: 32,
  },
  showName: {
    color: "#F0A500",
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 4,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  headerSubtitle: {
    color: "#C4B5FD",
    fontSize: 11,
  },
  guideTitle: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: "#1F1235",
    marginBottom: 4,
  },
  guideDivider: {
    height: 3,
    backgroundColor: "#F0A500",
    marginBottom: 28,
    width: 60,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#2D1B69",
    marginBottom: 10,
    marginTop: 24,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  bodyText: {
    fontSize: 10,
    color: "#374151",
    lineHeight: 1.7,
    marginBottom: 8,
  },
  bulletItem: {
    fontSize: 10,
    color: "#374151",
    lineHeight: 1.7,
    marginBottom: 4,
    paddingLeft: 12,
  },
  quoteItem: {
    fontSize: 10,
    color: "#4B5563",
    lineHeight: 1.7,
    marginBottom: 8,
    fontFamily: "Helvetica-Oblique",
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: "#F0A500",
  },
  actionItem: {
    fontSize: 10,
    color: "#374151",
    lineHeight: 1.6,
    marginBottom: 6,
    paddingLeft: 16,
  },
  checkBox: {
    width: 10,
    height: 10,
    borderWidth: 1,
    borderColor: "#9CA3AF",
    marginRight: 8,
    marginTop: 1,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  footer: {
    marginTop: 36,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  footerText: {
    fontSize: 9,
    color: "#9CA3AF",
    textAlign: "center",
  },
  ctaBox: {
    backgroundColor: "#F5F3FF",
    borderWidth: 1,
    borderColor: "#DDD6FE",
    borderRadius: 6,
    padding: 16,
    marginTop: 28,
    marginBottom: 8,
  },
  ctaTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#2D1B69",
    marginBottom: 4,
  },
  ctaText: {
    fontSize: 10,
    color: "#4C1D95",
    lineHeight: 1.6,
  },
  ctaUrl: {
    fontSize: 10,
    color: "#7C3AED",
    marginTop: 6,
    fontFamily: "Helvetica-Bold",
  },
});

function parseLines(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

interface EpisodeGuidePDFProps {
  showName: string;
  episodeTitle: string;
  episodeNumber: number | null;
  guestName: string | null;
  guideBio: string;
  guideFrameworks: string;
  guideTakeaways: string;
  guideQuotes: string;
  guideActionItems: string;
  assessmentUrl: string;
}

export function EpisodeGuidePDF({
  showName,
  episodeTitle,
  episodeNumber,
  guestName,
  guideBio,
  guideFrameworks,
  guideTakeaways,
  guideQuotes,
  guideActionItems,
  assessmentUrl,
}: EpisodeGuidePDFProps) {
  const guideTitle = guestName
    ? `${guestName} Episode Guide`
    : `Episode Guide`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.showName}>{showName}</Text>
          {episodeNumber && (
            <Text style={styles.headerSubtitle}>Episode {episodeNumber}</Text>
          )}
          <Text style={styles.headerTitle}>{episodeTitle}</Text>
        </View>

        {/* Guide title */}
        <Text style={styles.guideTitle}>{guideTitle}</Text>
        <View style={styles.guideDivider} />

        {/* About the guest */}
        {guideBio ? (
          <View>
            <Text style={styles.sectionTitle}>About {guestName ?? "the guest"}</Text>
            {parseLines(guideBio).map((line, i) => (
              <Text key={i} style={styles.bodyText}>{line}</Text>
            ))}
          </View>
        ) : null}

        {/* Key frameworks */}
        {guideFrameworks ? (
          <View>
            <Text style={styles.sectionTitle}>Key Frameworks & Strategies</Text>
            {parseLines(guideFrameworks).map((line, i) => (
              <Text key={i} style={line.startsWith("-") ? styles.bulletItem : styles.bodyText}>
                {line}
              </Text>
            ))}
          </View>
        ) : null}

        {/* Key takeaways */}
        {guideTakeaways ? (
          <View>
            <Text style={styles.sectionTitle}>Key Takeaways</Text>
            {parseLines(guideTakeaways).map((line, i) => (
              <Text key={i} style={styles.bodyText}>{line}</Text>
            ))}
          </View>
        ) : null}

        {/* Memorable quotes */}
        {guideQuotes ? (
          <View>
            <Text style={styles.sectionTitle}>Memorable Quotes</Text>
            {parseLines(guideQuotes).map((line, i) => (
              <Text key={i} style={styles.quoteItem}>{line}</Text>
            ))}
          </View>
        ) : null}

        {/* Action items */}
        {guideActionItems ? (
          <View>
            <Text style={styles.sectionTitle}>Action Items</Text>
            {parseLines(guideActionItems).map((line, i) => (
              <View key={i} style={styles.actionRow}>
                <View style={styles.checkBox} />
                <Text style={styles.actionItem}>
                  {line.startsWith("-") ? line.slice(1).trim() : line}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* CTA box */}
        <View style={styles.ctaBox}>
          <Text style={styles.ctaTitle}>Not sure where to start?</Text>
          <Text style={styles.ctaText}>
            Take our free assessment and we&apos;ll match you with the right episodes,
            resources, and support based on exactly what you&apos;re going through.
          </Text>
          <Text style={styles.ctaUrl}>{assessmentUrl}</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © {new Date().getFullYear()} {showName} — All rights reserved
          </Text>
        </View>
      </Page>
    </Document>
  );
}
