# Smart Clinic Management System  
# IBM Java・Database Capstone Project 報告書  
📽 [Click here to watch full demo on YouTube](https://www.youtube.com/watch?v=TfYPPA7sIvk)  
クリックすると YouTube 上で再生されます（チャプター付き）。

## プロジェクト目的

IBMが提供する「Java and Database Capstone Project」は、Javaとデータベース技術を実際の開発を通して学ぶことを目的とした経験型プロジェクトです。本プロジェクトでは、診療所管理システムを開発し、医師、患者、管理者の各立場で活用できるウェブアプリケーションの構築を目指します。ロールベースアクセス制御（RBAC）を導入することで、セキュリティと操作権限の明確化も実現しています。さらに、今回のバージョンでは、OpenAIのGPT-3.5 Turboモデルを用いたバーチャルレセプショニスト機能を実装し、患者の問い合わせ対応や適切な診療科目の案内を自動化・高度化しました。

## プロジェクト概要

Java言語とSpring Bootを使用し、MVCパターンを基盤としたRESTful API型システムを開発します。データはMySQLおよびMongoDBで管理され、フロントエンドは基本的なHTML/CSS/JavaScriptで実装されます。プロジェクトはLinux環境上のIBM Cloudでデプロイされ、Dockerによるコンテナ化、およびGitHub Actionsを用いたCI/CDパイプラインを導入し、継続的インテグレーションと自動デプロイも体験しました。さらに、OpenAI GPT-3.5 Turboを活用したバーチャルレセプショニストをREST APIとして統合し、患者からの自然言語問い合わせに対して的確な診療科目選択や基本案内を実施しています。

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

### 4. バーチャルレセプショニスト（AI受付）

* OpenAI GPT-3.5 Turboモデルを用いた自然言語処理  
* 患者の問い合わせ内容を解析し、適切な診療科目を推薦  
* よくある質問の自動応答機能  
* 診療予約のガイダンス  

## 技術スタック

### バックエンド

* Java 11+  
* Spring Boot  
* Spring Data JPA / MongoDB Driver  
* Spring Security（RBAC）  
* RESTful API  
* **OpenAI API（GPT-3.5 Turbo）統合による自然言語処理**

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
* REST API を用いたクライアントサービスとOpenAI GPT-3.5 Turbo APIの連携  
* Dockerによるマイクロサービス化も想定（AIサービスは別コンテナ/外部サービス）  
* GitHub ActionsによるCI/CD自動化パイプライン  

## 結論

本プロジェクトでは、Java/Springによる堅牢な診療所管理システムに加え、OpenAI GPT-3.5 Turboを活用した高度なバーチャルレセプショニスト機能を実装することで、患者へのサービス品質向上を図りました。AI受付機能により、患者の問い合わせに対する迅速かつ的確な対応が可能となり、診療科目の案内や予約サポートを効率化しました。これにより、医療機関の運用効率向上と患者満足度の向上が期待でき、最新のAI技術を医療システムに融合させる有効性を実証しました。

***
