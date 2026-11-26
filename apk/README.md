# APK 目录使用说明

页面下载按钮固定指向 `apk/modelkey-latest.apk`，页面上显示的版本号、日期、大小、SHA-256 和历史版本表格全部来自同目录的 `release.json`。换包时只改这一目录，不用动页面代码。

## 目录内容

```
apk/
├── modelkey-latest.apk        # 固定文件名，下载按钮指向这里
├── modelkey-v2.2.2.38.apk     # 版本化文件名，归档用，可长期保留
├── release.json               # 版本配置，页面自动读取
└── README.md                  # 本说明
```

## 更新版本（3 步）

1. **放入新包**
   - 把新 APK 复制为本目录的 `modelkey-latest.apk`（覆盖旧文件）。
   - 同时复制一份带版本号的归档，例如 `modelkey-v2.2.3.0.apk`，旧版本文件不要删。

2. **修改 `release.json`**
   - 更新 `latest` 里的 `version`、`releaseDate`、`sizeBytes`、`sha256`、`notes`。
   - 在 `history` 数组最前面插入一条新版本记录（保留旧记录）。
   - `fileName` 保持 `modelkey-latest.apk` 不变。

3. **重新部署**
   - 本地替换只改变磁盘文件；线上站点需要重新发布一次，修改才会生效。

## 字段说明

| 字段 | 说明 |
| --- | --- |
| `version` | 版本号，页面会自动加前缀 `v` 显示 |
| `releaseDate` | 更新日期，建议 `YYYY-MM-DD` |
| `fileName` | 下载按钮指向的文件名，固定为 `modelkey-latest.apk` |
| `sizeBytes` | 文件字节数，页面自动换算 MB；用 `stat -f%z 文件名` 获取 |
| `platform` | 系统要求，显示在下载信息区 |
| `sha256` | 文件校验值，用 `shasum -a 256 文件名` 获取 |
| `history[].versionedFile` | 历史版本文件名，渲染为表格里的下载链接 |

## 注意

- `release.json` 必须是合法 JSON（双引号、末尾不能有逗号），改完可用 `python3 -m json.tool release.json` 校验。
- 如果 JSON 读取失败（例如直接双击本地 HTML 用 `file://` 打开），页面会自动使用 `index.html` 内置的默认版本信息，不影响下载按钮。
- `modelkey-latest.apk` 与版本化文件内容应完全一致，只是文件名不同。

## 当前版本

- 版本：`v2.2.2.38`
- 日期：`2026-11-24`
- 大小：`4379372` 字节（约 4.2 MB）
- SHA-256：`aed3c30b38a1a3f8cf028add43b2d125ac98857a7c5bdac00d5510005ed56080`
