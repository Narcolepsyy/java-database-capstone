# Smart Clinic Management System
# IBM Java・Database Capstone Project 報告書
📽 [Click here to watch full demo on YouTube](https://www.youtube.com/watch?v=TfYPPA7sIvk)
クリックすると YouTube 上で再生されます（チャプター付き）。

## プロジェクト目的

IBMが提供する「Java and Database Capstone Project」は、Javaとデータベース技術を実際の開発を通して学ぶことを目的とした経験型プロジェクトです。本プロジェクトでは、診療所管理システムを開発し、医師、患者、管理者の各立場で活用できるウェブアプリケーションの構築を目指します。ロールベースアクセス制御（RBAC）を導入することで、セキュリティと操作権限の明確化も実現しています。

## プロジェクト概要

Java言語とSpring Bootを使用し、MVCパターンを基盤としたRESTful API型システムを開発します。データはMySQLおよびMongoDBで管理され、フロントエンドは基本的なHTML/CSS/JavaScriptで実装されます。プロジェクトはLinux環境上のIBM Cloudでデプロイされ、Dockerによるコンテナ化、およびGitHub Actionsを用いたCI/CDパイプラインを導入し、継続的インテグレーションと自動デプロイも体験しました。

## 主要機能

### 1. 診療管理

* 患者の登録、検索
* 診療内容の管理
* 出力用の診断結果の保存

### 2. 予約機能

* 医師の検索と予約作成
* 日付別のスケジュール管理

### 3. ユーザー管理

* ロールベースアクセス制御（RBAC）に基づくログイン/登録
* 管理者のみ患者情報の一括管理・医師の登録などが可能

## 技術スタック

### バックエンド

* Java 11+
* Spring Boot
* Spring Data JPA / MongoDB Driver
* Spring Security（RBAC）
* RESTful API

### データベース

* MySQL（リレーショナルデータ管理）
* MongoDB（柔軟な診療記録保存）

### フロントエンド

* HTML5 / CSS3 / JavaScript

### 開発/運用ツール

* IntelliJ Ultimate 
* Docker（コンテナ管理）
* GitHub Actions（CI/CD）
* IBM Cloud（Linux上での実行環境）

## システムアーキテクチャ

* MVC構成
* 3層アーキテクチャ: Controller ─ Service ─ Repository
* REST API を用いたクライアントサービス
* Dockerによるマイクロサービス化も想定
* GitHub ActionsによるCI/CD自動化パイプライン

## 結論

IBM Java and Database Capstoneプロジェクトは、現実的な診療所管理システムの開発を通じて、Java/Springの技術やデータベース（MySQL/MongoDB）、クラウド運用、コンテナ技術、CI/CDなどの実践的なスキルを総合的に学べる内容となっています。特にロールベースアクセス制御を通して、現場でのセキュアなシステム設計の考え方や運用の重要性も実感することができました。
