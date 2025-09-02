@echo off
echo 正在准备部署文件...

REM 创建部署目录
if not exist "deploy" mkdir deploy

REM 复制文件到部署目录
copy index.html deploy\
copy style.css deploy\
copy script.js deploy\
copy README.md deploy\

echo.
echo 文件已准备完成！
echo.
echo 部署选项：
echo.
echo 1. GitHub Pages:
echo    - 将 deploy 文件夹中的所有文件上传到 GitHub 仓库
echo    - 在仓库设置中启用 GitHub Pages
echo.
echo 2. Netlify:
echo    - 访问 https://netlify.com
echo    - 拖拽 deploy 文件夹到 Netlify
echo.
echo 3. Vercel:
echo    - 访问 https://vercel.com
echo    - 导入 GitHub 仓库或上传文件夹
echo.
pause