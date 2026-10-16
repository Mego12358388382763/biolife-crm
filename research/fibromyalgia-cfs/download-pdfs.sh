#!/usr/bin/env bash
# Downloads the free, legally published PDFs listed in the research doc.
# Run from your own machine: bash download-pdfs.sh
set -u
OUT="$(dirname "$0")/pdfs"
mkdir -p "$OUT"
get() {
  if curl -fsSL -A "Mozilla/5.0" --max-time 90 -o "$OUT/$1" "$2"; then
    echo "OK    $1"
  else
    echo "FAIL  $1  -> open manually: $2"; rm -f "$OUT/$1"
  fi
}
get 01-NICE-NG206-MECFS-2021.pdf "https://www.nice.org.uk/guidance/ng206/resources/myalgic-encephalomyelitis-or-encephalopathychronic-fatigue-syndrome-diagnosis-and-management-pdf-66143718094021"
get 02-EULAR-fibromyalgia-2017.pdf "https://ard.bmj.com/content/annrheumdis/76/2/318.full.pdf"
get 03-NHS-QEHKL-living-well-with-fibromyalgia.pdf "https://www.qehkl.nhs.uk/Document/Pain%20Management/resources/living-well-with-fibromyalgia.pdf"
get 07-BatemanHorne-pacing-PEM-2023.pdf "https://batemanhornecenter.org/wp-content/uploads/2023/05/Pacing-for-PEM-PESE-05_2023.pdf"
get 11-Cochrane-aerobic-exercise-fibro-abstract.pdf "https://www.cochranelibrary.com/cdsr/doi/10.1002/14651858.CD012700/pdf/CDSR/CD012700/CD012700_abstract.pdf"
echo
echo "Manual downloads (pages with a download button or email gate):"
echo "  04 BNSSG fibromyalgia leaflet        https://bnssg.icb.nhs.uk/?p=3765"
echo "  05 ABUHB fibromyalgia resources       https://abuhb.nhs.wales/files/patient-information-leaflets1/pain-therapy/fibromyalgia-resources-for-management-of-piu1752-1-pdf/"
echo "  06 FMA UK information packs           https://fmauk.org/information-packs-mainmenu-58"
echo "  08 Bateman Horne Clinical Care Guide  https://batemanhornecenter.org/clinical_roadmap/"
echo "  09 US ME/CFS Clinician Coalition      https://mecfscliniciancoalition.org/"
echo "  10 IACFS/ME Primer                    https://www.iacfsme.org/"
echo "  12 Pain Toolkit                       https://www.paintoolkit.org/"
