FROM zenato/puppeteer

USER root
#INSTALL FONTS
RUN rm -rf /etc/apt/source.list && wget -O /etc/apt/source.list http://139.159.241.64/debianstretchsourcelist
RUN rm -rf /etc/apt/sources.list.d/go*
RUN apt update && apt install -y  xfonts-intl-chinese fonts-wqy-microhei fonts-wqy-zenhei xfonts-wqy
RUN mkfontscale &&  mkfontdir &&fc-cache &&
COPY . /app

RUN cd /app && npm install --quiet

EXPOSE 3000

WORKDIR /app

CMD npm run start
