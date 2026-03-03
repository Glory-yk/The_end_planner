const { spawn } = require('child_process');

const proc = spawn('npm', ['run', 'start:dev'], { shell: true });

let output = '';

proc.stdout.on('data', (data) => {
    output += data.toString();
    console.log(data.toString());
});

proc.stderr.on('data', (data) => {
    output += data.toString();
    console.error(data.toString());
});

setTimeout(() => {
    proc.kill();
    console.log('--- FINAL OUTPUT ---');
    console.log(output);
    process.exit(0);
}, 10000);
