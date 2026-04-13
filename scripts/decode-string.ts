import * as fs from "node:fs";
import * as zlib from "node:zlib";
const str = 'eJyVVdtu2zgQ/RVjnlqUVmdIDi96W2S3iwK7L23RhzVcgJZph4AsBZISJDH87wVl143jbC4S9KCZ4TlzOSNtYdV2m+s6QAn3P+RkOrmffJjE26t391cPXybTCaX3H1V6P/kwqUDAugvLFJsBytkMxf6muZgRCizc8VWhIIGFeXQdvHrv9dojeYPWaUXKyoPXZijvJbFxRlrN6B3t4Q5Uh+PKSn4AkRNQp8cEzecCUnMTuwHKVaj7KGDowtVFW7ddatZ/NWFRx+WJr4dytoXh7ipCCXVqIggIUGLByGS9xMzglVUCFtnsjELS2ng1PiygymZyDp3zniUxo1R2J46oVeqqOuNWsRliB+VsioW0LA2hdNJYzaSMmGKBVjrUnq0m7RHZzAXkEVz3IwcyKuVIacodkPpZDiystN5L76RhbdH4zGCUJi/ZoWNGb/UJAWqLTpNUknNPjTa7+b5Ln5shNn0a7qCUvDf9faKN149IzOht0YV9XiHqOXnxc8p0JyomPip8LmDRdsvY/Z9yHnihHAuijHGwP+rWJnXdiPJtP6t2tYKs0zSkUH9LmwgloVVOQHXdD+0Gyu1OwPKuCZtUQbmFy3j77y+MT6EaMukWBihRwE2orzPATpyE/Zn64XvoUhhS25xF406MWg/da3CHMcUnIKr97jw0T6lg453yxrEkVNaZUaUnMViwJCm1V4adJiaVdXZOrncCuvp76tOijl9Cs45PEnpURhMay4gWSZ4RUqGMZ03GOSeRpBr50uZFZCu9M8qwJ88WrX0CmbVS5NFbkoxec0behNvPQ+zG3vfnLcUn2v/yvPK6hfoNB6pHIY/rw7NqcBzDy8jpWNyb0/6jWdfnYiJHu91xJf77dPxbrS7atlv+3paL364K85e6ydYU+tSs/4k3sYZSC1iEZvl107bDZWrWOY2fd1j7tg==';
function deserialize(str: string): unknown {
  const buffer = Buffer.from(str, "base64");
  const json = zlib.inflateSync(buffer).toString("utf-8");
  return JSON.parse(json);
}

fs.writeFileSync(".output.json", JSON.stringify(deserialize(str), null, 2), "utf-8");
