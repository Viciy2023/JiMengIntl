FROM wwwzhouhui569/jimeng-free-api-all:latest

# Hugging Face Spaces 会向容器注入 PORT，这里同步为项目读取的 SERVER_PORT。
ENV SERVER_HOST=0.0.0.0

CMD ["sh", "-c", "export SERVER_PORT=${PORT:-7860} && npm start"]
