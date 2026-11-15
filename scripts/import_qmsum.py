#!/usr/bin/env python3
"""Build a compact, attributed sample of QMSum test-set reference summaries."""

import json
from pathlib import Path
from urllib.request import urlopen


ROOT = "https://raw.githubusercontent.com/Yale-LILY/QMSum/main/data"
DOMAINS = ("Academic", "Product", "Committee")
OUTPUT = Path(__file__).resolve().parents[1] / "src" / "qmsum-samples.json"


def main() -> None:
    examples = []
    for domain in DOMAINS:
        source_url = f"{ROOT}/{domain}/jsonl/test.jsonl"
        with urlopen(source_url, timeout=30) as response:
            records = [json.loads(line) for line in response.read().decode("utf-8").splitlines()]
        for index, record in enumerate(records, start=1):
            reference = record["general_query_list"][0]
            examples.append(
                {
                    "id": f"QMSUM-{domain[:3].upper()}-{index:02}",
                    "domain": domain,
                    "topic": record["topic_list"][0]["topic"],
                    "query": reference["query"],
                    "summary": reference["answer"],
                    "transcriptTurns": len(record["meeting_transcripts"]),
                    "split": "test",
                    "sourceUrl": f"https://github.com/Yale-LILY/QMSum/blob/main/data/{domain}/jsonl/test.jsonl",
                }
            )

    OUTPUT.write_text(json.dumps(examples, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(examples)} QMSum examples to {OUTPUT}")


if __name__ == "__main__":
    main()
