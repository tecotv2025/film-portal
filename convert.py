import requests
import json
import re

def resolve_true_url(vidmody_url):
    headers = {
        "User-Agent": "googleuser"
    }
    try:
        response = requests.get(vidmody_url, headers=headers, timeout=10)
        if response.status_code == 200:
            lines = response.text.splitlines()
            for line in lines:
                line = line.strip()
                if line.startswith("http") and "thumbnail" in line:
                    base_url = re.sub(r"thumbnail.*?\.jpg", "index.m3u8", line)
                    return base_url
        print(f"UYARI: Beklenen format bulunamadı - {vidmody_url}")
        return None
    except Exception as e:
        print(f"HATA: {vidmody_url} - {e}")
        return None

def process_m3u_url(m3u_url, output_file):
    headers = {
        "User-Agent": "googleuser"
    }
    try:
        response = requests.get(m3u_url, headers=headers, timeout=10)
        response.raise_for_status()
        lines = response.text.splitlines()
        urls = [line.strip() for line in lines if line.strip() and not line.startswith("#")]

        results = []
        for url in urls:
            resolved = resolve_true_url(url)
            results.append({
                "original_url": url,
                "resolved_url": resolved
            })

        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(results, f, indent=2, ensure_ascii=False)

        print(f"{len(results)} link işlendi. Sonuçlar '{output_file}' dosyasına yazıldı.")
    except Exception as e:
        print(f"HATA: M3U dosyası indirilemedi - {e}")

if __name__ == "__main__":
    m3u_url = "https://raw.githubusercontent.com/GitLatte/patr0n/refs/heads/site/lists/power-sinema.m3u"
    process_m3u_url(m3u_url, "resolved.json")
