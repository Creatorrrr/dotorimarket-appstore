FROM node:12-alpine
WORKDIR /app
COPY . .
WORKDIR /app/frontend
RUN npm ci
RUN npm run build
RUN rm -r /app/frontend
WORKDIR /app/backend
RUN npm ci --only=production
CMD ["npm", "run", "start"]
EXPOSE 3000