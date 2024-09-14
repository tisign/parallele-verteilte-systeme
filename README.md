# Parallele-Verteilte-Systeme

Andrin Germann - Till Wietlisbach

## Übersicht Umsetzung

### 1 - Stock Publisher - 1x

Den Stock Publisher haben wir direkt von den Vorlagen übernommen. Er ist für das Erzeugen von Aktienkursen zuständig. Die Aktienkurse werden in einem festen Intervall erzeugt.

### 2 - RabbitMQ - 1x

RabbitMQ wird direkt vom offiziellen Docker Image verwendet. 

### 3 - Stock Subscriber - 3x

Für jede Aktie wird ein Stock Subscriber erzeugt. Wir haben den Subscriber in JavaScript umgesetzt. Jeder Subscriber liest einen Aktienqueue, sammelt 1000 Nachrichten und berechnet den Durchschnittspreis für Einkauf und Verkauf. Dann werden die Ergebnisse, gemeinsam mit der Summe an Ein- und Verkäufen in das MongoDB Cluster geschrieben. Wir schreiben die Daten in die stockdb Datenbank und jeweils in eine eigene Collection pro Aktie.

### 4 - MongoDB - Cluster aus 3 Nodes

Das MongoDB Cluster besteht aus 3 Nodes.

### 5 - Stock Liveview - 2x

Der Stock Liveview haben wir aus den Vorlagen übernommen. Da wir die Daten anders akumulieren, mussten wir die Abfrage anpassen. Der Stock Liveview lädt das neuste Dokument aus jeder Collection und zeigt Ein- und Verkaufspreise an. Wir passen ausserdem die Anzeige Farblich anhand der Preisentwicklung an (positiv -> grün, negativ -> rot, neutral -> grau). Die Liveviews werden über einen Loadbalancer verteilt. Sollte der Websocket geschlossen werden, startet der Stock Liveview automatisch nach 5 Sekunden neu.

### 6 - Loadbalancer - 1x

Der nginx Loadbalancer verteilt die Anfragen auf die Stock Liveviews nach dem least connections Prinzip.

## Zusätzliche Dateien

Neben dem Docker Compose werden noch die .env Files benötigt

## Container

Die Container wurden auf einem Windows 11 Pro Rechner erstellt und getestet. Sie funktionieren aber auch im Kompatibilitätsmodus auf MacOS M Prozessoren.