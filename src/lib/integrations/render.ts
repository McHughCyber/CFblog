import {
  type AdSensePlacementKey,
  type IntegrationsSettings,
  isAdSensePublisherId,
  isAdSenseSlotId,
  isGoogleAnalyticsMeasurementId
} from "./schema";

function escapeAttribute(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function shouldRenderGoogleAnalytics(settings: IntegrationsSettings): boolean {
  const measurementId = settings.googleAnalytics.measurementId;
  return (
    settings.googleAnalytics.enabled &&
    typeof measurementId === "string" &&
    isGoogleAnalyticsMeasurementId(measurementId)
  );
}

export function shouldRenderAdSenseLoader(settings: IntegrationsSettings): boolean {
  const publisherId = settings.googleAdSense.publisherId;
  return (
    settings.googleAdSense.enabled &&
    typeof publisherId === "string" &&
    isAdSensePublisherId(publisherId)
  );
}

export function shouldRenderAdSenseSlot(
  settings: IntegrationsSettings,
  placementKey: AdSensePlacementKey
): boolean {
  const publisherId = settings.googleAdSense.publisherId;
  const placement = settings.googleAdSense.placements[placementKey];
  return (
    shouldRenderAdSenseLoader(settings) &&
    settings.googleAdSense.mode === "manual" &&
    placement.enabled &&
    typeof publisherId === "string" &&
    typeof placement.slotId === "string" &&
    isAdSenseSlotId(placement.slotId)
  );
}

export function renderGoogleAnalyticsHtml(settings: IntegrationsSettings): string {
  if (!shouldRenderGoogleAnalytics(settings)) {
    return "";
  }

  const measurementId = settings.googleAnalytics.measurementId as string;
  const escapedMeasurementId = escapeAttribute(measurementId);
  return `<script async src="https://www.googletagmanager.com/gtag/js?id=${escapedMeasurementId}"></script>
<script>
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${escapedMeasurementId}');
</script>`;
}

export function renderAdSenseLoaderHtml(settings: IntegrationsSettings): string {
  if (!shouldRenderAdSenseLoader(settings)) {
    return "";
  }

  const publisherId = settings.googleAdSense.publisherId as string;
  const escapedPublisherId = escapeAttribute(publisherId);
  return `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${escapedPublisherId}" crossorigin="anonymous"></script>`;
}

export function renderAdSenseSlotHtml(
  settings: IntegrationsSettings,
  placementKey: AdSensePlacementKey
): string {
  if (!shouldRenderAdSenseSlot(settings, placementKey)) {
    return "";
  }

  const publisherId = escapeAttribute(settings.googleAdSense.publisherId as string);
  const slotId = escapeAttribute(settings.googleAdSense.placements[placementKey].slotId as string);

  return `<div class="cf-ad-slot" data-ad-placement="${escapeAttribute(placementKey)}">
  <ins class="adsbygoogle"
    style="display:block"
    data-ad-client="${publisherId}"
    data-ad-slot="${slotId}"
    data-ad-format="auto"
    data-full-width-responsive="true"></ins>
  <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
</div>`;
}
