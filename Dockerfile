FROM node:10-alpine

WORKDIR /var/app

RUN apk add --no-cache git && \
    npm install mocha nyc codecov -g

COPY package.json .

RUN npm install

COPY . .

CMD ["mocha"]

# docker run -e "DEBUG=etitle" -v `pwd`:/var/app local/etitle:js
# docker run -e "DEBUG=etitle" -v `pwd`:/var/app local/etitle:js nyc --reporter=html --reporter=text mocha
# docker run -e "DEBUG=etitle" -v `pwd`:/var/app local/etitle:js codecov -t $GUID
