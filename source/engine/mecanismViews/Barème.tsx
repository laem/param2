import classNames from 'classnames'
import React from 'react'
import { Trans } from 'react-i18next'
import { makeJsx } from '../evaluation'
import './Barème.css'
import { Node, NodeValuePointer } from './common'

export default function Barème(nodeValue, explanation, _, unit) {
	return (
		<Node
			classes="mecanism barème"
			name="barème"
			value={nodeValue}
			unit={unit}
			child={
				<ul className="properties">
					<BarèmeAttributes explanation={explanation} />
					<TrancheTable
						tranches={explanation.tranches}
						multiplicateur={explanation.multiplicateur}
					/>
					{/* nous avons remarqué que la notion de taux moyen pour un barème à 2 tranches est moins pertinent pour les règles de calcul des indépendants. Règle empirique à faire évoluer ! */}
					{nodeValue !== null && explanation.tranches.length > 2 && (
						<>
							<b>
								<Trans>Taux moyen</Trans> :{' '}
							</b>
							<NodeValuePointer
								data={(100 * nodeValue) / explanation.assiette.nodeValue}
								unit="%"
							/>
						</>
					)}
				</ul>
			}
		/>
	)
}

export let BarèmeAttributes = ({ explanation }) => {
	const multiplicateur = explanation.multiplicateur
	return (
		<>
			<li key="assiette">
				<span className="key">
					<Trans>assiette</Trans>:{' '}
				</span>
				<span className="value">{makeJsx(explanation.assiette)}</span>
			</li>
			{multiplicateur && !multiplicateur.isDefault && (
				<li key="multiplicateur">
					<span className="key">
						<Trans>multiplicateur</Trans>:{' '}
					</span>
					<span className="value">{makeJsx(multiplicateur)}</span>
				</li>
			)}
		</>
	)
}

export const TrancheTable = ({ tranches, multiplicateur }) => (
	<table className="tranches">
		<thead>
			<tr>
				<th>
					<Trans>Plafonds</Trans>
				</th>
				{tranches[0].taux && (
					<th>
						<Trans>Taux</Trans>
					</th>
				)}
				{(tranches[0].montant || tranches[0].nodeValue !== null) && (
					<th>
						<Trans>Montant</Trans>
					</th>
				)}
			</tr>
		</thead>
		<tbody>
			{tranches.map((tranche, i) => (
				<Tranche key={i} tranche={tranche} multiplicateur={multiplicateur} />
			))}
		</tbody>
	</table>
)

const Tranche = ({ tranche, multiplicateur }) => {
	const isHighlighted =
		tranche.isActive || (tranche.nodeValue != null && tranche.nodeValue)
	if (!tranche.nodeValue === null && tranche.plafond.nodeValue === Infinity) {
		return null
	}
	return (
		<tr className={classNames('tranche', { activated: isHighlighted })}>
			<td key="tranche">
				{tranche.plafond.nodeValue === Infinity ? (
					<Trans>Au-delà du dernier plafond</Trans>
				) : (
					<>
						<Trans>Jusqu'à</Trans> <strong>{makeJsx(tranche.plafond)}</strong>
						{multiplicateur && !multiplicateur.isDefault && (
							<>
								{' × '}
								{makeJsx(multiplicateur)}
							</>
						)}
					</>
				)}
			</td>
			{tranche.taux && <td key="taux">{makeJsx(tranche.taux)}</td>}
			{(tranche.nodeValue !== null || tranche.montant) && (
				<td key="value">
					{tranche.montant ? (
						makeJsx(tranche.montant)
					) : (
						<NodeValuePointer data={tranche.nodeValue} unit={tranche.unit} />
					)}
				</td>
			)}
		</tr>
	)
}
