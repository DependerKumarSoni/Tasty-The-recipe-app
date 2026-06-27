function Footer() {
    return (
        <footer className="footer">
            <style>{`
                .footer {
                    padding: 20px 24px;
                    text-align: center;
                    font-size: 14px;
                    color: #9aa5b1;
                    border-top: 1px solid #e4e7eb;
                    margin-top: 40px;
                }
            `}</style>
            <p>
                Built with React Router • Recipe data from {''}
                <a href="">Void Link</a>
            </p>
        </footer>
    )
}

export default Footer;