FROM node:12-alpine
WORKDIR /app
COPY ./backend .
RUN npm ci --only=production
CMD ["npm", "run", "start"]
EXPOSE 3000