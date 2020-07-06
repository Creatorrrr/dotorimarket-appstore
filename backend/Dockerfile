FROM node:12-alpine
WORKDIR /server
COPY . .
RUN npm ci --only=production
CMD ["npm", "run", "start"]
EXPOSE 3000