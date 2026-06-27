function Loader({label = 'Loading..'}) {
    return (
        <div className='loader'>
            <style>{`
                .loader {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
            `}</style>
            <div className='spinner'></div>
            <span>{label}</span>
        </div>
    )
}

export default Loader