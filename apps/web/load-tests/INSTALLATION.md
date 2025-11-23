# k6 Installation Instructions

Complete installation guide for k6 load testing tool.

## macOS

### Using Homebrew (Recommended)

```bash
brew install k6
```

Verify installation:
```bash
k6 version
```

## Linux

### Debian/Ubuntu

```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

### Fedora/CentOS

```bash
sudo dnf install https://dl.k6.io/rpm/repo.rpm
sudo dnf install k6
```

### Arch Linux

```bash
yay k6
```

## Windows

### Using Chocolatey

```bash
choco install k6
```

### Using Windows Package Manager (winget)

```bash
winget install k6 --source winget
```

### Using Scoop

```bash
scoop install k6
```

## Docker

Run k6 in Docker without installing:

```bash
docker pull grafana/k6:latest

# Run a test
docker run --rm -i --network=host \
  -v $(pwd)/load-tests:/load-tests \
  grafana/k6 run /load-tests/baseline.js
```

## Binary Download

Download pre-built binaries from GitHub:

1. Visit: https://github.com/grafana/k6/releases
2. Download the appropriate binary for your platform
3. Extract and add to PATH

### Example for Linux:

```bash
wget https://github.com/grafana/k6/releases/download/v0.48.0/k6-v0.48.0-linux-amd64.tar.gz
tar -xzf k6-v0.48.0-linux-amd64.tar.gz
sudo mv k6-v0.48.0-linux-amd64/k6 /usr/local/bin/
```

## Verify Installation

After installation, verify k6 is working:

```bash
k6 version
```

Expected output:
```
k6 v0.48.0 (go1.21.5, linux/amd64)
```

Run a simple test:

```bash
k6 run - <<EOF
import http from 'k6/http';
import { sleep } from 'k6';

export default function () {
  http.get('https://test.k6.io');
  sleep(1);
}
EOF
```

## Troubleshooting

### k6 command not found

Solution:
- Ensure k6 is in your PATH
- Try reinstalling or using absolute path

### Permission denied

Solution:
```bash
chmod +x /path/to/k6
```

### WSL2 (Windows Subsystem for Linux)

Use the Linux installation method inside WSL2.

## Cloud Alternative

If you cannot install k6 locally, use k6 Cloud:

1. Sign up: https://k6.io/cloud/
2. Run tests from cloud
3. View results in web dashboard

## CI/CD Installation

### GitHub Actions

See `.github/workflows/load-test.yml` for automated setup.

### GitLab CI

```yaml
stages:
  - test

load-test:
  stage: test
  image: grafana/k6:latest
  script:
    - k6 run load-tests/baseline.js
```

### Jenkins

```groovy
stage('Load Test') {
  agent {
    docker {
      image 'grafana/k6:latest'
    }
  }
  steps {
    sh 'k6 run load-tests/baseline.js'
  }
}
```

## Next Steps

After installation:

1. Verify: `k6 version`
2. Read: `load-tests/QUICK_START.md`
3. Run: `k6 run load-tests/baseline.js`

## Resources

- Official Installation Guide: https://k6.io/docs/get-started/installation/
- GitHub Releases: https://github.com/grafana/k6/releases
- Docker Hub: https://hub.docker.com/r/grafana/k6

## Support

For installation issues:
- k6 Community Forum: https://community.k6.io/
- GitHub Issues: https://github.com/grafana/k6/issues
