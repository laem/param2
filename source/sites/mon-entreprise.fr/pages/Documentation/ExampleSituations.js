// Page listing the engine's currently implemented mecanisms and their tests
import { React, T } from 'Components'
import withColours from 'Components/utils/withColours'
import { analyseMany } from 'Engine/traverse'
import { compose } from 'ramda'
import emoji from 'react-easy-emoji'
import { connect } from 'react-redux'
import examples from 'Règles/cas-types.yaml'
import {
	parsedRulesSelector,
	ruleDefaultsSelector
} from 'Selectors/analyseSelectors'
import './ExampleSituations.css'

export default class ExampleSituations extends React.Component {
	render() {
		return (
			<div className="ui__ container" id="exampleSituations">
				<h1>
					{emoji('💡 ')}
					<T>Quelques exemples de salaires</T>
				</h1>
				<ul>
					{examples.map(ex => (
						<Example ex={ex} key={ex.nom} />
					))}
				</ul>
			</div>
		)
	}
}

const Example = compose(
	connect(state => ({
		defaults: ruleDefaultsSelector(state),
		parsedRules: parsedRulesSelector(state)
	})),
	withColours
)(
	class Example extends React.Component {
		render() {
			let {
					ex: { nom, situation },
					parsedRules,
					defaults,
					colours
				} = this.props,
				[total, net, netAprèsImpôts] = analyseMany(parsedRules, [
					'total',
					'net',
					'net après impôt'
				])(dottedName => ({ ...defaults, ...situation }[dottedName])).targets,
				figures = [
					total,
					do {
						let dottedName = 'contrat salarié . rémunération . brut de base'
						;({
							dottedName,
							nodeValue: situation[dottedName],
							title: 'Salaire brut'
						})
					},
					net,
					{ ...netAprèsImpôts, title: 'Après impôt' }
				]

			return (
				<li className="example">
					<h2>{nom}</h2>
					<ul>
						{figures.map(t => (
							<li key={t.dottedName}>
								<h3>{t.title}</h3>
								<span
									style={{ color: colours.textColourOnWhite }}
									className="figure">
									{Math.round(t.nodeValue)} €
								</span>
							</li>
						))}{' '}
						<li key="%">
							<h3>Prélèvements</h3>
							<span
								style={{ color: colours.textColourOnWhite }}
								className="figure">
								{do {
									let de = figures[0].nodeValue,
										à = figures[3].nodeValue
									Math.round(((de - à) / de) * 100)
								}}{' '}
								%
							</span>
						</li>
					</ul>
				</li>
			)
		}
	}
)
