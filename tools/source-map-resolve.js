const fs = require("fs");
const { SourceMapConsumer } = require("source-map");

async function main() {
    const input = JSON.parse(fs.readFileSync(0, "utf8"));
    const mapFile = input.mapFile;
    const line = Number(input.line);
    const column = Number(input.column);

    if (!mapFile || !Number.isInteger(line) || !Number.isInteger(column)) {
        process.stdout.write(JSON.stringify({
            error: "Invalid input",
        }));
        process.exit(1);
    }

    if (!fs.existsSync(mapFile)) {
        process.stdout.write(JSON.stringify({
            error: "Source map not found",
        }));
        process.exit(2);
    }

    const rawSourceMap = JSON.parse(fs.readFileSync(mapFile, "utf8"));
    const result = await SourceMapConsumer.with(
        rawSourceMap,
        null,
        (consumer) => consumer.originalPositionFor({
            line,
            column,
        }),
    );

    process.stdout.write(JSON.stringify(result));
}

main().catch((error) => {
    process.stderr.write(error.stack || String(error));
    process.exit(3);
});
