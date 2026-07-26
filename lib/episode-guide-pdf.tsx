import {
  Document,
  Page,
  Text,
  View,
  Image,
  Link,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#F7F8FC",
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 48,
    fontFamily: "Helvetica",
  },
  header: {
    backgroundColor: "#0944B9",
    marginHorizontal: -48,
    marginTop: -48,
    paddingHorizontal: 48,
    paddingVertical: 28,
    marginBottom: 32,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  guideTitle: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: "#1E3A5F",
    marginBottom: 4,
  },
  guideDivider: {
    height: 3,
    backgroundColor: "#F26522",
    marginBottom: 28,
    width: 60,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#1E3A5F",
    marginBottom: 10,
    marginTop: 24,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#F26522",
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
    borderLeftColor: "#4ECDC4",
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
  aboutRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  headshot: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
    marginTop: 24,
  },
  aboutBody: {
    flex: 1,
  },
  giftBox: {
    marginTop: 12,
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F26522",
    borderRadius: 6,
  },
  giftTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#1E3A5F",
    marginBottom: 6,
  },
  giftLink: {
    marginTop: 10,
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#F26522",
    textDecoration: "none",
  },
});

function parseLines(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

// Collapses arbitrary, inconsistently-formatted source text (e.g. raw
// Collab Pilot free gift descriptions, which vary wildly submitter to
// submitter -- emoji-per-line, ALL-CAPS quoted blocks, stray line
// breaks) into one clean flowing paragraph, dropping any line that's
// nothing but a bullet/checkmark/emoji symbol.
const SYMBOL_ONLY_LINE_RE = /^[\p{Extended_Pictographic}•✓✔\-*\s]+$/u;

function normalizeToParagraph(text: string): string {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !SYMBOL_ONLY_LINE_RE.test(l))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

interface PanelistGuidePDFProps {
  panelistName: string;
  headshotUrl?: string | null;
  guideBio: string;
  guideFrameworks: string;
  guideTakeaways: string;
  guideQuotes: string;
  guideActionItems: string;
  freeGiftTitle?: string | null;
  freeGiftDescription?: string | null;
  freeGiftUrl?: string | null;
}

export function PanelistGuidePDF({
  panelistName,
  headshotUrl,
  guideBio,
  guideFrameworks,
  guideTakeaways,
  guideQuotes,
  guideActionItems,
  freeGiftTitle,
  freeGiftDescription,
  freeGiftUrl,
}: PanelistGuidePDFProps) {
  const guideTitle = `${panelistName} Guide`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Big Impact Experts Success Guide</Text>
        </View>

        {/* Guide title */}
        <Text style={styles.guideTitle}>{guideTitle}</Text>
        <View style={styles.guideDivider} />

        {/* About the panelist */}
        {guideBio ? (
          <View style={styles.aboutRow}>
            {headshotUrl ? <Image src={headshotUrl} style={styles.headshot} /> : null}
            <View style={styles.aboutBody}>
              <Text style={styles.sectionTitle}>About {panelistName}</Text>
              {parseLines(guideBio).map((line, i) => (
                <Text key={i} style={styles.bodyText}>{line}</Text>
              ))}
            </View>
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

        {/* Free gift */}
        {freeGiftTitle ? (
          <View>
            <Text style={styles.sectionTitle}>Free Gift from {panelistName}</Text>
            <View style={styles.giftBox}>
              <Text style={styles.giftTitle}>{freeGiftTitle}</Text>
              {freeGiftDescription ? (
                <Text style={styles.bodyText}>
                  {normalizeToParagraph(freeGiftDescription)}
                </Text>
              ) : null}
              {freeGiftUrl ? (
                <Link src={freeGiftUrl} style={styles.giftLink}>
                  Get the free gift →
                </Link>
              ) : null}
            </View>
          </View>
        ) : null}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © {new Date().getFullYear()} BigImpactExperts.com
          </Text>
        </View>
      </Page>
    </Document>
  );
}
